import os
import re

def find_broken_references():
    workspace = os.getcwd()
    search_dirs = [".", "Tripod", "Storage", "lightings", "Microphones", "Gimbal", "Battery", "Bagpack", "Views", "Data", "Camera", "Lens"]
    
    # Simple regex to find src="..." or "/Assets/..." or "Assets/..."
    # We want to capture anything in quotes that points to Assets/
    pattern = re.compile(r'["\']([^"\']*/Assets/[^"\']+)["\']', re.IGNORECASE)
    
    broken_refs = []
    
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        for root, _, files in os.walk(s_dir):
            if "node_modules" in root or ".git" in root or "scratch" in root:
                continue
            for file in files:
                if file.endswith(('.html', '.ejs', '.js', '.css')):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        
                    matches = pattern.findall(content)
                    for m in matches:
                        clean_path = m.strip()
                        # Resolve path relative to file or workspace
                        if clean_path.startswith("/"):
                            local_path = os.path.join(workspace, clean_path.lstrip("/"))
                        elif clean_path.startswith("../"):
                            local_path = os.path.normpath(os.path.join(root, clean_path))
                        else:
                            # Try both relative to file and relative to workspace
                            local_path1 = os.path.normpath(os.path.join(root, clean_path))
                            local_path2 = os.path.join(workspace, clean_path)
                            if os.path.exists(local_path1):
                                local_path = local_path1
                            else:
                                local_path = local_path2
                                
                        if not os.path.exists(local_path):
                            broken_refs.append({
                                "file": os.path.relpath(file_path, workspace),
                                "ref": m,
                                "resolved": os.path.relpath(local_path, workspace) if os.path.exists(os.path.dirname(local_path)) else local_path
                            })
                            
    return broken_refs

def main():
    broken = find_broken_references()
    print(f"Total broken image references found: {len(broken)}")
    for b in broken:
        print(f"File: {b['file']}")
        print(f"  Reference: {b['ref']}")
        print(f"  Resolved path (does not exist): {b['resolved']}")
        print("-" * 50)

if __name__ == "__main__":
    main()
