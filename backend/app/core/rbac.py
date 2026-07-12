"""
Generic role-based dependency factory.
Usage: Depends(require_roles(UserRole.admin, UserRole.fleet_manager))
"""
from fastapi import Depends, HTTPException, status
from .. import models
from .security import get_current_user

def require_roles(*allowed_roles: models.UserRole):
    def dependency(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles and current_user.role != models.UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {[r.value for r in allowed_roles]}",
            )
        return current_user
    return dependency