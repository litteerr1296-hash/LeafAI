from django.db import migrations


def polish_leafai_service_plan_copy(apps, schema_editor):
    ServicePlan = apps.get_model("engagement", "ServicePlan")

    plans = {
        "seed": {
            "description": "Bắt đầu miễn phí với kiểm tra lá cây, lịch sử ngắn và chat AI cơ bản.",
            "metadata": {
                "icon": "seed",
                "badge": "Free",
                "features": [
                    "Kiểm tra ảnh lá cây 5 lần mỗi ngày",
                    "Lưu lịch sử 7 ngày gần nhất",
                    "Chat AI 3 câu mỗi ngày",
                    "Tải ảnh hoặc chụp trực tiếp",
                ],
            },
        },
        "grow": {
            "description": "Tần suất cao hơn, lịch sử dài hơn và bắt đầu lập kế hoạch trồng cây.",
            "metadata": {
                "icon": "sprout",
                "features": [
                    "Kiểm tra ảnh lá cây 30 lần mỗi ngày",
                    "Lưu lịch sử 30 ngày",
                    "Chat AI 20 câu mỗi ngày",
                    "Lập 2 kế hoạch trồng cây",
                ],
            },
        },
        "bloom": {
            "description": "Mở khóa đầy đủ tính năng, chat chuyên gia và ưu tiên xử lý.",
            "metadata": {
                "icon": "tree",
                "badge": "Phổ biến nhất",
                "highlight": True,
                "features": [
                    "Kiểm tra ảnh lá không giới hạn",
                    "Lưu toàn bộ lịch sử",
                    "Chat AI không giới hạn",
                    "Chat chuyên gia nông nghiệp",
                    "Lập 10 kế hoạch trồng cây",
                    "Ưu tiên tốc độ xử lý",
                ],
            },
        },
        "elite": {
            "description": "Gói chuyên nghiệp với PDF, API access và hỗ trợ ưu tiên.",
            "metadata": {
                "icon": "crown",
                "features": [
                    "Tất cả tính năng Bloom",
                    "Xuất báo cáo PDF",
                    "API access",
                    "Kế hoạch trồng cây không giới hạn",
                    "Hỗ trợ ưu tiên qua email và chat",
                ],
            },
        },
    }

    for slug, data in plans.items():
        ServicePlan.objects.filter(slug=slug).update(**data)


class Migration(migrations.Migration):
    dependencies = [
        ("engagement", "0004_seed_leafai_service_plans"),
    ]

    operations = [
        migrations.RunPython(polish_leafai_service_plan_copy, migrations.RunPython.noop),
    ]
