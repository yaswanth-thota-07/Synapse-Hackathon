import os
import sys
import time
import numpy as np
import pandas as pd
import yfinance as yf


def clean_val(val, round_digits=None):
    """
    Cleans a field value. Returns 'NA' if None, empty, NaN, or Inf.
    Optionally rounds numeric values.
    """
    if val is None:
        return "NA"
    if isinstance(val, (int, float, np.number)):
        if np.isnan(val) or np.isinf(val):
            return "NA"
        if round_digits is not None:
            return round(float(val), round_digits)
        return val
    s = str(val).strip()
    if s == "" or s.upper() in ("NONE", "NAN", "NULL", "N/A"):
        return "NA"
    return s


def compute_price_metrics(hist):
    """
    Computes return_1y, return_3y, and annualized volatility from 3-year history.
    """
    if hist is None or hist.empty or "Close" not in hist.columns:
        return "NA", "NA", "NA"

    close = hist["Close"].dropna()
    # Filter out non-positive prices
    close = close[close > 0]
    n_days = len(close)

    if n_days < 2:
        return "NA", "NA", "NA"

    # return_1y: % change over the last ~252 trading days
    if n_days >= 252:
        p_now = close.iloc[-1]
        p_1y = close.iloc[-252]
        if p_1y != 0 and not np.isnan(p_1y) and not np.isnan(p_now):
            return_1y = round(float((p_now - p_1y) / p_1y), 4)
        else:
            return_1y = "NA"
    else:
        return_1y = "NA"

    # return_3y: % change over the full 3y period
    p_now = close.iloc[-1]
    p_start = close.iloc[0]
    if p_start != 0 and not np.isnan(p_start) and not np.isnan(p_now):
        return_3y = round(float((p_now - p_start) / p_start), 4)
    else:
        return_3y = "NA"

    # volatility: annualized std dev of daily log returns (std * sqrt(252))
    log_returns = np.log(close / close.shift(1)).dropna()
    if len(log_returns) > 1:
        daily_std = float(log_returns.std(ddof=1))
        volatility = round(float(daily_std * np.sqrt(252)), 4)
    else:
        volatility = "NA"

    return return_1y, return_3y, volatility


def fetch_ticker_data(row):
    """
    Fetches fundamental and market data for a single company row.
    Returns (data_dict, is_success).
    """
    csv_sector = row.get("sector")
    company_name = row.get("company_name")
    ticker = str(row.get("ticker")).strip()

    info = {}
    hist = pd.DataFrame()
    fetch_error = False

    try:
        ticker_obj = yf.Ticker(ticker)
        try:
            info = ticker_obj.info
            if not isinstance(info, dict):
                info = {}
        except Exception as e:
            info = {}

        try:
            hist = ticker_obj.history(period="3y")
        except Exception as e:
            hist = pd.DataFrame()

    except Exception as e:
        fetch_error = True

    # Check if data was retrieved
    has_valid_info = bool(info) and any(
        k in info for k in ("symbol", "quoteType", "shortName", "longBusinessSummary", "marketCap")
    )
    has_valid_hist = hist is not None and not hist.empty

    if fetch_error or (not has_valid_info and not has_valid_hist):
        is_success = False
    else:
        is_success = True

    # 1. sector & industry
    sector = info.get("sector")
    if sector is None or pd.isna(sector) or str(sector).strip() == "" or str(sector).strip().upper() == "NONE":
        sector = csv_sector if (csv_sector is not None and pd.notna(csv_sector) and str(csv_sector).strip() != "") else "NA"

    industry = clean_val(info.get("industry"))

    # 2. business_description
    business_description = clean_val(info.get("longBusinessSummary"))

    # 3. Fundamentals
    revenue_growth = clean_val(info.get("revenueGrowth"))
    profit_margin = clean_val(info.get("profitMargins"))
    ROE = clean_val(info.get("returnOnEquity"))
    ROA = clean_val(info.get("returnOnAssets"))
    debt_equity = clean_val(info.get("debtToEquity"))
    PE = clean_val(info.get("trailingPE"))
    PB = clean_val(info.get("priceToBook"))
    market_cap = clean_val(info.get("marketCap"))

    # 4. Market
    beta = clean_val(info.get("beta"))

    # 5. Price history metrics
    return_1y, return_3y, volatility = compute_price_metrics(hist)

    record = {
        "company_name": company_name,
        "ticker": ticker,
        "sector": sector,
        "industry": industry,
        "business_description": business_description,
        "revenue_growth": revenue_growth,
        "profit_margin": profit_margin,
        "ROE": ROE,
        "ROA": ROA,
        "debt_equity": debt_equity,
        "PE": PE,
        "PB": PB,
        "market_cap": market_cap,
        "return_1y": return_1y,
        "return_3y": return_3y,
        "volatility": volatility,
        "beta": beta,
    }

    return record, is_success


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    tickers_path = os.path.join(script_dir, "tickers.csv")
    output_path = os.path.join(script_dir, "peer_group_dataset.csv")

    if not os.path.exists(tickers_path):
        print(f"Error: {tickers_path} not found.")
        sys.exit(1)

    print(f"Loading tickers from {tickers_path}...")
    tickers_df = pd.read_csv(tickers_path)
    total_tickers = len(tickers_df)
    print(f"Found {total_tickers} tickers to process.")

    records = []
    successful_count = 0
    failed_tickers = []

    start_time = time.time()

    for idx, row in tickers_df.iterrows():
        ticker = str(row.get("ticker")).strip()
        comp_name = row.get("company_name")
        curr_num = idx + 1

        print(f"[{curr_num}/{total_tickers}] Fetching {ticker} ({comp_name})...", end=" ", flush=True)

        record, is_success = fetch_ticker_data(row)
        records.append(record)

        if is_success:
            successful_count += 1
            print("OK")
        else:
            failed_tickers.append(ticker)
            print("FAILED (marked with 'NA')")

        # Periodic checkpoint save every 25 tickers
        if curr_num % 25 == 0:
            temp_df = pd.DataFrame(records)
            temp_df.to_csv(output_path, index=False)

        # Sleep 1 second between requests to avoid rate limiting
        time.sleep(1)

    elapsed_time = time.time() - start_time

    # Create final DataFrame with the exact specified column order
    columns = [
        "company_name",
        "ticker",
        "sector",
        "industry",
        "business_description",
        "revenue_growth",
        "profit_margin",
        "ROE",
        "ROA",
        "debt_equity",
        "PE",
        "PB",
        "market_cap",
        "return_1y",
        "return_3y",
        "volatility",
        "beta",
    ]

    result_df = pd.DataFrame(records)[columns]

    # Exclude failed tickers from final dataset
    if failed_tickers:
        result_df = result_df[~result_df["ticker"].isin(failed_tickers)]

    print(f"\nSaving final dataset to {output_path}...")
    result_df.to_csv(output_path, index=False)
    print(f"Successfully saved {len(result_df)} rows to {output_path}.")

    # Summary
    print("\n" + "=" * 50)
    print("FETCH SUMMARY")
    print("=" * 50)
    print(f"Total companies processed : {total_tickers}")
    print(f"Successfully fetched      : {successful_count}")
    print(f"Failed to fetch           : {len(failed_tickers)}")
    print(f"Total time elapsed        : {elapsed_time:.1f} seconds")

    if failed_tickers:
        print("\nFailed tickers list:")
        for ft in failed_tickers:
            print(f" - {ft}")
    else:
        print("\nFailed tickers list: None (All tickers fetched successfully!)")
    print("=" * 50)


if __name__ == "__main__":
    main()
