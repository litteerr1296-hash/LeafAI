from django.db import migrations


def seed_leafai_service_plans(apps, schema_editor):
    ServicePlan = apps.get_model("engagement", "ServicePlan")

    plans = [
        {
            "slug": "seed",
            "name": "Seed",
            "description": "Bat dau mien phi voi kiem tra la cay, lich su ngan va chat AI co ban.",
            "price_monthly": 0,
            "currency": "VND",
            "yolo_enabled": True,
            "cnn_enabled": True,
            "rag_enabled": True,
            "expert_chat_enabled": False,
            "max_diagnoses_per_month": 150,
            "metadata": {
                "icon": "seed",
                "badge": "Free",
                "features": [
                    "Kiem tra anh la cay 5 lan moi ngay",
                    "Luu lich su 7 ngay gan nhat",
                    "Chat AI 3 cau moi ngay",
                    "Tai anh hoac chup truc tiep",
                ],
            },
            "is_active": True,
        },
        {
            "slug": "grow",
            "name": "Grow",
            "description": "Tan suat cao hon, lich su dai hon va bat dau lap ke hoach trong cay.",
            "price_monthly": 9000,
            "currency": "VND",
            "yolo_enabled": True,
            "cnn_enabled": True,
            "rag_enabled": True,
            "expert_chat_enabled": False,
            "max_diagnoses_per_month": 900,
            "metadata": {
                "icon": "sprout",
                "features": [
                    "Kiem tra anh la cay 30 lan moi ngay",
                    "Luu lich su 30 ngay",
                    "Chat AI 20 cau moi ngay",
                    "Lap 2 ke hoach trong cay",
                ],
            },
            "is_active": True,
        },
        {
            "slug": "bloom",
            "name": "Bloom",
            "description": "Mo khoa day du tinh nang, chat chuyen gia va uu tien xu ly.",
            "price_monthly": 39000,
            "currency": "VND",
            "yolo_enabled": True,
            "cnn_enabled": True,
            "rag_enabled": True,
            "expert_chat_enabled": True,
            "max_diagnoses_per_month": 0,
            "metadata": {
                "icon": "tree",
                "badge": "Pho bien nhat",
                "highlight": True,
                "features": [
                    "Kiem tra anh la khong gioi han",
                    "Luu toan bo lich su",
                    "Chat AI khong gioi han",
                    "Chat chuyen gia nong nghiep",
                    "Lap 10 ke hoach trong cay",
                    "Uu tien toc do xu ly",
                ],
            },
            "is_active": True,
        },
        {
            "slug": "elite",
            "name": "Elite",
            "description": "Goi chuyen nghiep voi PDF, API access va ho tro uu tien.",
            "price_monthly": 99000,
            "currency": "VND",
            "yolo_enabled": True,
            "cnn_enabled": True,
            "rag_enabled": True,
            "expert_chat_enabled": True,
            "max_diagnoses_per_month": 0,
            "metadata": {
                "icon": "crown",
                "features": [
                    "Tat ca tinh nang Bloom",
                    "Xuat bao cao PDF",
                    "API access",
                    "Ke hoach trong cay khong gioi han",
                    "Ho tro uu tien qua email va chat",
                ],
            },
            "is_active": True,
        },
    ]

    for item in plans:
        ServicePlan.objects.update_or_create(slug=item["slug"], defaults=item)

    ServicePlan.objects.filter(slug__in=["free", "pro", "plus"]).update(is_active=False)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("engagement", "0003_update_service_plans_vietnamese"),
    ]

    operations = [
        migrations.RunPython(seed_leafai_service_plans, noop_reverse),
    ]
