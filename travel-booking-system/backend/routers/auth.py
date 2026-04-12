import os
import hashlib
from pathlib import Path
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import bcrypt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_super_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])

AVATAR_DIR = Path(__file__).resolve().parents[1] / "uploads" / "avatars"
AVATAR_DIR.mkdir(parents=True, exist_ok=True)


def _password_digest(password: str) -> bytes:
    # Pre-hash to avoid bcrypt's 72-byte input limit while keeping deterministic verification.
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("ascii")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_password_digest(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_password_digest(password), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()

    existing = db.query(models.User).filter(models.User.email == normalized_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=payload.name,
        email=normalized_email,
        password_hash=get_password_hash(payload.password),
        phone=payload.phone,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return schemas.Token(access_token=token)


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/me/avatar", response_model=schemas.UserOut)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    suffix = Path(file.filename or "avatar.png").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        suffix = ".png"

    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > 4 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size must be 4MB or less")

    if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
        old_name = current_user.avatar_url.rsplit("/", 1)[-1]
        old_path = AVATAR_DIR / old_name
        if old_path.exists():
            old_path.unlink(missing_ok=True)

    filename = f"u{current_user.id}_{uuid4().hex[:12]}{suffix}"
    target = AVATAR_DIR / filename
    target.write_bytes(content)

    current_user.avatar_url = f"/uploads/avatars/{filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)

    new_email = updates.get("email")
    if new_email:
        new_email = new_email.strip().lower()
    if new_email and new_email != current_user.email:
        existing = db.query(models.User).filter(models.User.email == new_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = new_email

    current_password = updates.get("current_password")
    new_password = updates.get("new_password")
    if current_password or new_password:
        if not current_password or not new_password:
            raise HTTPException(
                status_code=400,
                detail="Both current_password and new_password are required",
            )
        if not verify_password(current_password, current_user.password_hash):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        current_user.password_hash = get_password_hash(new_password)

    for field in ("name", "phone", "avatar_url"):
        if field in updates:
            setattr(current_user, field, updates[field])

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
