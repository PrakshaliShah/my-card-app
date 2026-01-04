import pandas as pd
import os

# 1. Configuration - Ensure this matches your local file name exactly
INPUT_FILENAME = "raw_data.xlsx" 
OUTPUT_FILENAME = "cleaned_credit_cards.csv" # We save as CSV because it's faster for React

def process_cards():
    if not os.path.exists(INPUT_FILENAME):
        print(f"Error: Could not find '{INPUT_FILENAME}'.")
        print("Check if the file is in the same folder as this script!")
        return

    print("Reading Excel data... (Spreadsheets take a bit longer to load than CSVs)")
    
    # FIX: Use read_excel and the openpyxl engine
    try:
        # header=9 tells pandas to skip the CFPB's intro text rows
        df = pd.read_excel(INPUT_FILENAME, header=9, engine='openpyxl')
    except Exception as e:
        print(f"Failed to read Excel file: {e}")
        return

    print("Found the data! Applying bifurcation logic...")
    
    # These are the columns your React app will use
    base_cols = ['Institution Name', 'Product Name', 'State', 'Annual Fee', 'Rewards']
    
    # Bifurcation Logic: Create the 'Student' and 'No SSN' filters
    df['is_student'] = df.apply(lambda x: x.astype(str).str.contains('Student', case=False).any(), axis=1)
    df['accepts_itin'] = df.apply(lambda x: x.astype(str).str.contains('ITIN', case=False).any(), axis=1)

    # Create the cleaned version
    cleaned_df = df[base_cols + ['is_student', 'accepts_itin']].copy()
    
    # Categorize rewards for the UI
    cleaned_df['Reward_Type'] = cleaned_df['Rewards'].fillna('None').apply(
        lambda x: 'Cashback' if 'Cashback' in x else ('Travel' if 'Travel' in x else 'General')
    )

    # Save to CSV for your React project
    cleaned_df.to_csv(OUTPUT_FILENAME, index=False)
    print(f"Success! '{OUTPUT_FILENAME}' is ready for your app.")

if __name__ == "__main__":
    process_cards()