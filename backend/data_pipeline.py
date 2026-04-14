import pandas as pd

MAX_ROWS = 100000
MAX_COLS = 300
PREVIEW_ROWS = 50


def load_and_validate(file_path):
    try:
        df = pd.read_csv(file_path, sep=None, engine="python", on_bad_lines="skip")
    except Exception:
        df = pd.read_csv(file_path, encoding="latin1", on_bad_lines="skip")

    if df.empty:
        raise ValueError("Uploaded CSV is empty")

    if df.shape[0] > MAX_ROWS:
        raise ValueError(f"Dataset too large: max rows allowed is {MAX_ROWS}")

    if df.shape[1] > MAX_COLS:
        raise ValueError(f"Dataset too wide: max columns allowed is {MAX_COLS}")

    return df


def _is_id_like_column(series):
    non_null = series.dropna()
    if non_null.empty:
        return False

    unique_ratio = non_null.nunique() / len(non_null)
    if unique_ratio < 0.97:
        return False

    sample = non_null.astype(str).head(20)
    lengths = sample.map(len)
    mostly_same_len = lengths.nunique() <= 2
    has_alnum_pattern = sample.str.contains(r"[A-Za-z].*\d|\d.*[A-Za-z]", regex=True).mean() > 0.6
    return mostly_same_len or has_alnum_pattern


def clean_dataframe(df):
    original_shape = df.shape

    duplicate_rows_before = int(df.duplicated().sum())
    df_clean = df.drop_duplicates().copy()

    dropped_columns = []
    id_like_columns = []

    for col in df_clean.columns:
        col_lower = col.lower().strip()
        if col_lower in {"id", "index", "uuid", "guid"} or col_lower.endswith("_id"):
            dropped_columns.append(col)
            id_like_columns.append(col)
            continue

        if _is_id_like_column(df_clean[col]):
            dropped_columns.append(col)
            id_like_columns.append(col)

    if dropped_columns:
        df_clean = df_clean.drop(columns=dropped_columns, errors="ignore")

    missing_before = int(df_clean.isnull().sum().sum())

    numeric_converted = []
    for col in df_clean.columns:
        converted = pd.to_numeric(df_clean[col], errors="coerce")
        if converted.notna().sum() >= int(0.7 * max(len(converted), 1)):
            df_clean[col] = converted
            numeric_converted.append(col)

    numeric_cols = df_clean.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = [c for c in df_clean.columns if c not in numeric_cols]

    if numeric_cols:
        df_clean[numeric_cols] = df_clean[numeric_cols].apply(lambda s: s.fillna(s.median()))
    if categorical_cols:
        df_clean[categorical_cols] = df_clean[categorical_cols].apply(
            lambda s: s.fillna(s.mode().iloc[0] if not s.mode().empty else "Unknown")
        )

    missing_after = int(df_clean.isnull().sum().sum())

    report = {
        "original_shape": [int(original_shape[0]), int(original_shape[1])],
        "cleaned_shape": [int(df_clean.shape[0]), int(df_clean.shape[1])],
        "duplicates_removed": duplicate_rows_before,
        "dropped_columns": dropped_columns,
        "id_like_columns_removed": id_like_columns,
        "missing_before": missing_before,
        "missing_after": missing_after,
        "missing_strategy": {
            "numeric": "median_imputation",
            "categorical": "mode_or_unknown_imputation",
        },
        "numeric_converted_columns": numeric_converted,
    }

    return df_clean, report


def _top_correlations(corr_df, limit=10):
    if corr_df.empty:
        return []

    pairs = []
    cols = list(corr_df.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            value = corr_df.iloc[i, j]
            if pd.notna(value):
                pairs.append(
                    {
                        "feature_a": cols[i],
                        "feature_b": cols[j],
                        "correlation": round(float(value), 4),
                        "abs_correlation": round(abs(float(value)), 4),
                    }
                )
    pairs.sort(key=lambda x: x["abs_correlation"], reverse=True)
    return pairs[:limit]


def analyze_dataframe(df):
    numeric_df = df.select_dtypes(include=["number"])
    describe_df = numeric_df.describe().round(4) if not numeric_df.empty else pd.DataFrame()
    corr_df = numeric_df.corr(numeric_only=True).round(4) if not numeric_df.empty else pd.DataFrame()

    summary = describe_df.to_dict() if not describe_df.empty else {}
    correlations = corr_df.to_dict() if not corr_df.empty else {}
    top_corr = _top_correlations(corr_df)

    return {
        "dataset": {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "column_names": [str(col) for col in df.columns],
            "numeric_columns": numeric_df.columns.tolist(),
            "categorical_columns": [c for c in df.columns if c not in numeric_df.columns.tolist()],
        },
        "statistics": {
            "summary": summary,
        },
        "correlations": {
            "matrix": correlations,
            "top_pairs": top_corr,
        },
        "preview": df.head(PREVIEW_ROWS).where(pd.notnull(df), None).to_dict(orient="records"),
    }