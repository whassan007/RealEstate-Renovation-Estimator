import sys
import os

# Add intelligence_layer to path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'intelligence_layer'))

from main import app
