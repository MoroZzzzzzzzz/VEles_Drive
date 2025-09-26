import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging
from jinja2 import Template

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@velesdrive.ru")
        self.from_name = "VELES DRIVE"
        
        # Email templates
        self.templates = {
            "welcome": """
            <h2>Добро пожаловать в VELES DRIVE!</h2>
            <p>Здравствуйте, {{ user_name }}!</p>
            <p>Спасибо за регистрацию на платформе VELES DRIVE - ведущей площадке для покупки и продажи автомобилей премиум класса.</p>
            <p><strong>Что вас ожидает:</strong></p>
            <ul>
                <li>Доступ к эксклюзивным автомобилям от проверенных дилеров</li>
                <li>Безопасные сделки с гарантией качества</li>
                <li>Персональные рекомендации</li>
            </ul>
            <p>Начните поиск автомобиля мечты уже сегодня!</p>
            <a href="{{ website_url }}" style="background: linear-gradient(45deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Перейти к каталогу</a>
            """,
            
            "dealer_welcome": """
            <h2>Добро пожаловать в VELES DRIVE!</h2>
            <p>Здравствуйте, {{ user_name }}!</p>
            <p>Вы зарегистрированы как дилер на платформе VELES DRIVE.</p>
            <p><strong>Следующие шаги:</strong></p>
            <ol>
                <li>Заполните профиль вашей компании</li>
                <li>Загрузите первые автомобили</li>
                <li>Пройдите верификацию</li>
            </ol>
            <p>Наша команда свяжется с вами для завершения процесса верификации.</p>
            <a href="{{ erp_url }}" style="background: linear-gradient(45deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Открыть ERP панель</a>
            """,
            
            "vehicle_approved": """
            <h2>Ваш автомобиль одобрен!</h2>
            <p>Здравствуйте, {{ dealer_name }}!</p>
            <p>Ваш автомобиль <strong>{{ vehicle_title }}</strong> прошел модерацию и опубликован на платформе.</p>
            <p><strong>Детали:</strong></p>
            <ul>
                <li>Автомобиль: {{ vehicle_title }}</li>
                <li>Цена: {{ vehicle_price }}</li>
                <li>Статус: Активен</li>
            </ul>
            <a href="{{ vehicle_url }}" style="background: linear-gradient(45deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Посмотреть объявление</a>
            """,
            
            "new_lead": """
            <h2>Новый лид!</h2>
            <p>Здравствуйте, {{ dealer_name }}!</p>
            <p>У вас новый потенциальный покупатель для автомобиля <strong>{{ vehicle_title }}</strong>.</p>
            <p><strong>Контактные данные:</strong></p>
            <ul>
                <li>Имя: {{ customer_name }}</li>
                <li>Email: {{ customer_email }}</li>
                <li>Телефон: {{ customer_phone }}</li>
            </ul>
            <p>Рекомендуем связаться с клиентом как можно скорее.</p>
            <a href="{{ erp_url }}" style="background: linear-gradient(45deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Управление лидами</a>
            """
        }
    
    def _create_message(self, to_email: str, subject: str, html_content: str) -> MIMEMultipart:
        """Create email message"""
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{self.from_name} <{self.from_email}>"
        msg['To'] = to_email
        
        # Add HTML part
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        return msg
    
    async def send_email(self, to_email: str, subject: str, template_name: str, context: dict) -> bool:
        """Send email using template"""
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.warning("Email credentials not configured, skipping email send")
                return True  # Return True in dev environment
            
            # Get template
            if template_name not in self.templates:
                raise ValueError(f"Template {template_name} not found")
            
            # Render template
            template = Template(self.templates[template_name])
            html_content = template.render(**context)
            
            # Create message
            msg = self._create_message(to_email, subject, html_content)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_welcome_email(self, user_email: str, user_name: str, user_role: str) -> bool:
        """Send welcome email based on user role"""
        context = {
            "user_name": user_name,
            "website_url": "https://velesdrive.ru",
            "erp_url": "https://velesdrive.ru/dealer/dashboard"
        }
        
        if user_role == "dealer":
            return await self.send_email(
                to_email=user_email,
                subject="Добро пожаловать в VELES DRIVE - Панель дилера",
                template_name="dealer_welcome",
                context=context
            )
        else:
            return await self.send_email(
                to_email=user_email,
                subject="Добро пожаловать в VELES DRIVE",
                template_name="welcome", 
                context=context
            )
    
    async def send_vehicle_approved_email(self, dealer_email: str, dealer_name: str, vehicle_data: dict) -> bool:
        """Send vehicle approval notification"""
        context = {
            "dealer_name": dealer_name,
            "vehicle_title": f"{vehicle_data.get('make')} {vehicle_data.get('model')} {vehicle_data.get('year')}",
            "vehicle_price": vehicle_data.get("price", "Не указана"),
            "vehicle_url": f"https://velesdrive.ru/vehicles/{vehicle_data.get('id')}"
        }
        
        return await self.send_email(
            to_email=dealer_email,
            subject="Автомобиль одобрен и опубликован",
            template_name="vehicle_approved",
            context=context
        )
    
    async def send_new_lead_email(self, dealer_email: str, dealer_name: str, customer_data: dict, vehicle_data: dict) -> bool:
        """Send new lead notification"""
        context = {
            "dealer_name": dealer_name,
            "vehicle_title": f"{vehicle_data.get('make')} {vehicle_data.get('model')}",
            "customer_name": customer_data.get("name"),
            "customer_email": customer_data.get("email"),
            "customer_phone": customer_data.get("phone", "Не указан"),
            "erp_url": "https://velesdrive.ru/dealer/dashboard"
        }
        
        return await self.send_email(
            to_email=dealer_email,
            subject="Новый лид по автомобилю",
            template_name="new_lead",
            context=context
        )

# Global service instance
email_service = EmailService()