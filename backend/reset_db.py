import os
import pandas as pd

storage_dir = "storage"
users_file = os.path.join(storage_dir, "users.xlsx")
history_file = os.path.join(storage_dir, "history.xlsx")
tokens_file = os.path.join(storage_dir, "tokens.xlsx")
notifs_file = os.path.join(storage_dir, "notifications.xlsx")

def clear_file(path, columns):
    if os.path.exists(path):
        try:
            print(f"🧹 Clearing {os.path.basename(path)}...")
            df = pd.DataFrame(columns=columns)
            df.to_excel(path, index=False)
            print(f"✅ {os.path.basename(path)} cleared.")
        except Exception as e:
            print(f"❌ Error clearing {os.path.basename(path)}: {e}")
            print("👉 Make sure the file is CLOSED in Excel.")

if __name__ == "__main__":
    print("🚀 Starting Database Reset...")
    
    clear_file(users_file, ["email", "full_name", "hashed_password", "created_at"])
    clear_file(history_file, ["id", "user_email", "label", "input_type", "sentiment", "summary_preview", "keywords", "result", "created_at"])
    clear_file(tokens_file, ["user_email", "token", "expires_at"])
    clear_file(notifs_file, ["id", "user_email", "title", "message", "type", "is_read", "created_at"])

    print("\n✨ Database reset complete! You can now restart your server and sign up fresh.")
