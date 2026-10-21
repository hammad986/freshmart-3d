from . import db
from .models import Category, Product, User

CATEGORIES = [
    ("Fruits & Vegetables", "fruits-vegetables"),
    ("Dairy & Eggs", "dairy-eggs"),
    ("Bakery", "bakery"),
    ("Beverages", "beverages"),
    ("Snacks", "snacks"),
    ("Household", "household"),
]

# name, description, price INR, stock, emoji, color, unit, shape, category slug
PRODUCTS = [
    ("Fresh Bananas (Robusta)", "Naturally ripened, potassium-rich bananas sourced daily.", 49, 120, "🍌", "#f9d976", "1 dozen", "fruit", "fruits-vegetables"),
    ("Shimla Apples", "Crisp and sweet premium Shimla apples.", 189, 60, "🍎", "#e74c3c", "1 kg", "fruit", "fruits-vegetables"),
    ("Alphonso Mangoes", "GI-tagged Ratnagiri Alphonso, naturally ripened.", 449, 35, "🥭", "#f5a623", "1 kg", "fruit", "fruits-vegetables"),
    ("Desi Tomatoes", "Firm, tangy tomatoes perfect for curries and salads.", 32, 150, "🍅", "#e74c3c", "1 kg", "fruit", "fruits-vegetables"),
    ("Red Onions", "Pungent, fresh onions for everyday cooking.", 45, 200, "🧅", "#9b59b6", "1 kg", "fruit", "fruits-vegetables"),
    ("Baby Spinach", "Tender hydroponic spinach leaves, triple-washed.", 39, 45, "🥬", "#27ae60", "250 g", "fruit", "fruits-vegetables"),
    ("Full Cream Milk", "Pasteurized full-cream milk, 6% fat.", 66, 90, "🥛", "#dfe6ee", "1 L", "bottle", "dairy-eggs"),
    ("Farm Eggs (Brown)", "Protein-rich brown eggs from free-range farms.", 84, 110, "🥚", "#d2a679", "12 pcs", "egg", "dairy-eggs"),
    ("Fresh Curd", "Thick, creamy set curd made daily.", 35, 80, "🍶", "#dfe6ee", "400 g", "bottle", "dairy-eggs"),
    ("Salted Butter", "Creamy salted butter, churned from fresh cream.", 58, 70, "🧈", "#f9d976", "100 g", "box", "dairy-eggs"),
    ("Paneer (Malai)", "Soft, fresh malai paneer for curries and snacks.", 95, 40, "🧀", "#f5f6fa", "200 g", "box", "dairy-eggs"),
    ("Whole Wheat Bread", "Soft 100% whole wheat sandwich bread, baked fresh.", 45, 65, "🍞", "#c89f6d", "400 g", "loaf", "bakery"),
    ("Butter Croissants", "Flaky, buttery croissants baked in-house every morning.", 120, 30, "🥐", "#d9a05b", "4 pcs", "loaf", "bakery"),
    ("Chocolate Muffins", "Rich double-chocolate muffins with choco chips.", 99, 50, "🧁", "#7b4b2a", "2 pcs", "loaf", "bakery"),
    ("Filter Coffee Powder", "80:20 coffee-chicory blend, slow roasted.", 165, 55, "☕", "#6f4e37", "500 g", "box", "beverages"),
    ("Green Tea (Tulsi)", "Antioxidant-rich tulsi green tea bags.", 145, 70, "🍵", "#27ae60", "25 bags", "box", "beverages"),
    ("Fresh Orange Juice", "Cold-pressed, no added sugar.", 89, 25, "🧃", "#f5a623", "1 L", "bottle", "beverages"),
    ("Tender Coconut Water", "Natural, hydrating tender coconut water.", 49, 60, "🥥", "#8b5a2b", "300 ml", "bottle", "beverages"),
    ("Potato Chips (Masala)", "Crunchy kettle-cooked chips with Indian masala.", 30, 140, "🍟", "#f9d976", "150 g", "bag", "snacks"),
    ("Dark Chocolate (70%)", "Rich 70% dark chocolate bar, single origin.", 149, 45, "🍫", "#4b2e2e", "100 g", "bar", "snacks"),
    ("Roasted Almonds", "Premium California almonds, dry roasted.", 320, 38, "🥜", "#c89f6d", "250 g", "bag", "snacks"),
    ("Dishwash Gel", "Lemon-fresh concentrated dishwash gel.", 99, 85, "🧴", "#1abc9c", "500 ml", "bottle", "household"),
    ("Detergent Powder", "Top-load detergent with colour protect.", 210, 75, "🧺", "#3498db", "2 kg", "box", "household"),
    ("Floor Cleaner (Pine)", "Disinfectant floor cleaner, kills 99.9% germs.", 149, 90, "🧼", "#27ae60", "1 L", "bottle", "household"),
]


def seed_if_empty():
    if User.query.first():
        return

    categories = {}
    for name, slug in CATEGORIES:
        cat = Category(name=name, slug=slug)
        db.session.add(cat)
        categories[slug] = cat
    db.session.flush()

    for name, desc, price, stock, emoji, color, unit, shape, slug in PRODUCTS:
        db.session.add(Product(
            name=name, description=desc, price=price, stock=stock,
            emoji=emoji, color=color, unit=unit, shape=shape,
            category_id=categories[slug].id,
        ))

    admin = User(name="FreshMart Admin", email="admin@freshmart.in", is_admin=True)
    admin.set_password("Admin@123")
    db.session.add(admin)

    demo = User(name="Demo Customer", email="user@freshmart.in")
    demo.set_password("User@1234")
    db.session.add(demo)

    db.session.commit()
    print("Database seeded with demo catalog and users.")
