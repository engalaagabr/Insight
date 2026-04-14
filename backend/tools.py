# tools.py

def save_output(data: str):
    with open("output.txt", "a") as f:
        f.write(data.strip() + "\n\n")
    return "Saved successfully."