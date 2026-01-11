from .auth import router as auth_router
from .users import router as users_router
from .scanner import router as scanner_router
from .content import router as content_router
from .community import router as community_router
from .events import router as events_router
from .admin import router as admin_router

# Re-export for easier imports
auth = type('Router', (), {'router': auth_router})()
users = type('Router', (), {'router': users_router})()
scanner = type('Router', (), {'router': scanner_router})()
content = type('Router', (), {'router': content_router})()
community = type('Router', (), {'router': community_router})()
events = type('Router', (), {'router': events_router})()
admin = type('Router', (), {'router': admin_router})()
