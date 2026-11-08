import sys, os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

VENV_PATH = os.path.join(BASE_DIR, "venv")
activate_this = os.path.join(VENV_PATH, "bin", "activate_this.py")
if os.path.exists(activate_this):
    with open(activate_this) as f:
        code = compile(f.read(), activate_this, 'exec')
        exec(code, dict(__file__=activate_this))

from app import create_app
application = create_app()
