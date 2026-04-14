# data_tools.py

import pandas as pd

# Global dataframe
df = None


def load_csv(file_path: str):
    global df
    df = pd.read_csv(file_path)
    return f"Dataset loaded successfully. Shape: {df.shape}"


def show_head(n: int = 5):
    if df is None:
        return "No dataset loaded."
    return df.head(n).to_string()


def clean_data(_=None):
    global df
    if df is None:
        return "No dataset loaded."
    df = df.dropna()
    return f"Data cleaned. New shape: {df.shape}"


def describe_data(_=None):
    if df is None:
        return "No dataset loaded."
    return df.describe().to_string()


def get_columns(_=None):
    if df is None:
        return "No dataset loaded."
    return str(df.columns.tolist())


def correlation_matrix(_=None):
    if df is None:
        return "No dataset loaded."
    return df.corr(numeric_only=True).to_string()