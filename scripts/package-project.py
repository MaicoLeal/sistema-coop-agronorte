from pathlib import Path
import zipfile

root = Path(r"C:\Users\Coop Agronorte\Documents\Coop_Agronorte_Hidroponia\Sistema_Importado")
out = root.parent / "sistema-coop-agronorte-animado-v2.zip"
exclude_dirs = {"node_modules", ".git", ".vite"}

with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if any(part in exclude_dirs for part in rel.parts) or path.is_dir():
            continue
        z.write(path, rel.as_posix())

with zipfile.ZipFile(out) as z:
    bad = z.testzip()
    names = z.namelist()
    checks = {
        "files": len(names),
        "bad": bad,
        "has_component": "src/components/AnimatedLandingPage.tsx" in names,
        "has_hero": "public/assets/agronorte-hero.jpg" in names,
        "has_dist": any(name.startswith("dist/") for name in names),
        "has_node_modules": any("node_modules" in name for name in names),
    }
print(out)
print(checks)
print(out.stat().st_size)
