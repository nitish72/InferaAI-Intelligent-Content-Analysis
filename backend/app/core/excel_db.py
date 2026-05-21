import pandas as pd
import os
from datetime import datetime
from threading import Lock

EXCEL_DIR = "storage"
USERS_FILE = os.path.join(EXCEL_DIR, "users.xlsx")
HISTORY_FILE = os.path.join(EXCEL_DIR, "history.xlsx")
TOKENS_FILE = os.path.join(EXCEL_DIR, "tokens.xlsx")
NOTIFICATIONS_FILE = os.path.join(EXCEL_DIR, "notifications.xlsx")

# Ensure storage directory exists
if not os.path.exists(EXCEL_DIR):
    os.makedirs(EXCEL_DIR)

# Thread-safe lock for file operations
db_lock = Lock()

def initialize_excel():
    with db_lock:
        if not os.path.exists(USERS_FILE):
            pd.DataFrame(columns=["email", "full_name", "hashed_password", "created_at"]).to_excel(USERS_FILE, index=False)
        if not os.path.exists(HISTORY_FILE):
            pd.DataFrame(columns=["id", "user_email", "label", "input_type", "sentiment", "summary_preview", "keywords", "result", "created_at"]).to_excel(HISTORY_FILE, index=False)
        if not os.path.exists(TOKENS_FILE):
            pd.DataFrame(columns=["user_email", "token", "expires_at"]).to_excel(TOKENS_FILE, index=False)
        if not os.path.exists(NOTIFICATIONS_FILE):
            pd.DataFrame(columns=["id", "user_email", "title", "message", "type", "is_read", "created_at"]).to_excel(NOTIFICATIONS_FILE, index=False)

class ExcelDB:
    @staticmethod
    def get_users():
        with db_lock:
            return pd.read_excel(USERS_FILE)

    @staticmethod
    def save_users(df):
        with db_lock:
            df.to_excel(USERS_FILE, index=False)

    @staticmethod
    def get_history():
        with db_lock:
            return pd.read_excel(HISTORY_FILE)

    @staticmethod
    def save_history(df):
        with db_lock:
            df.to_excel(HISTORY_FILE, index=False)

    @staticmethod
    def get_tokens():
        with db_lock:
            return pd.read_excel(TOKENS_FILE)

    @staticmethod
    def save_tokens(df):
        with db_lock:
            df.to_excel(TOKENS_FILE, index=False)

    @staticmethod
    def get_notifications():
        with db_lock:
            return pd.read_excel(NOTIFICATIONS_FILE)

    @staticmethod
    def save_notifications(df):
        with db_lock:
            df.to_excel(NOTIFICATIONS_FILE, index=False)

# Initialize on import
initialize_excel()
