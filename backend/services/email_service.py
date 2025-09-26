import os
from typing import Optional, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# For now, we'll use a mock email service if SendGrid is not configured
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'noreply@velesdrive.ru')

class EmailService:
    def __init__(self):
        self.is_configured = bool(SENDGRID_API_KEY)
        if self.is_configured:
            self.sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        else:
            logger.warning("SendGrid API key not configured. Email notifications will be logged only.")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send email via SendGrid or log if not configured"""
        try:
            if not self.is_configured:
                logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
                logger.info(f"[MOCK EMAIL] Content: {html_content}")
                return True

            from_email = Email(SENDER_EMAIL)
            to_email_obj = To(to_email)
            
            message = Mail(
                from_email=from_email,
                to_emails=to_email_obj,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_content
            )

            response = self.sg.send(message)
            success = response.status_code == 202
            
            if success:
                logger.info(f"Email sent successfully to {to_email}")
            else:
                logger.error(f"Failed to send email to {to_email}, status: {response.status_code}")
            
            return success

        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False

    async def send_new_message_notification(
        self,
        recipient_email: str,
        recipient_name: str,
        sender_name: str,
        message_preview: str,
        vehicle_info: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send notification about new message"""
        subject = f"Новое сообщение от {sender_name} - VELES DRIVE"
        
        vehicle_section = ""
        if vehicle_info:
            vehicle_section = f"""
            <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #ffa500;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Обсуждается автомобиль:</h4>
                <p style="margin: 0; font-weight: bold; color: #ffa500;">
                    {vehicle_info.get('make', '')} {vehicle_info.get('model', '')} {vehicle_info.get('year', '')}
                </p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    Цена: {vehicle_info.get('price_formatted', 'По запросу')}
                </p>
            </div>
            """

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">VELES DRIVE</h1>
                <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Премиум автомобили</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Здравствуйте, {recipient_name}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Вы получили новое сообщение от <strong>{sender_name}</strong>:
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffa500; margin: 20px 0;">
                    <p style="margin: 0; font-style: italic; color: #666;">
                        "{message_preview}{'...' if len(message_preview) > 100 else ''}"
                    </p>
                </div>
                
                {vehicle_section}
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://velesdrive.ru/messages" 
                       style="background: #ffa500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Ответить на сообщение
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    Это автоматическое уведомление от VELES DRIVE.<br>
                    Если вы не хотите получать такие уведомления, обратитесь в службу поддержки.
                </p>
            </div>
        </body>
        </html>
        """

        return await self.send_email(recipient_email, subject, html_content)

    async def send_new_review_notification(
        self,
        dealer_email: str,
        dealer_name: str,
        reviewer_name: str,
        rating: int,
        review_title: str,
        review_comment: str
    ) -> bool:
        """Send notification about new review"""
        subject = f"Новый отзыв о вашем автосалоне - VELES DRIVE"
        
        stars = "★" * rating + "☆" * (5 - rating)
        rating_color = "#4CAF50" if rating >= 4 else "#FF9800" if rating >= 3 else "#F44336"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">VELES DRIVE</h1>
                <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Премиум автомобили</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Здравствуйте, {dealer_name}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Вы получили новый отзыв от клиента <strong>{reviewer_name}</strong>:
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid {rating_color}; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <span style="font-size: 24px; color: {rating_color};">{stars}</span>
                        <span style="margin-left: 10px; font-size: 18px; color: {rating_color}; font-weight: bold;">
                            {rating}/5
                        </span>
                    </div>
                    
                    <h4 style="margin: 0 0 10px 0; color: #333;">{review_title}</h4>
                    <p style="margin: 0; color: #666; font-style: italic;">
                        "{review_comment[:200]}{'...' if len(review_comment) > 200 else ''}"
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://velesdrive.ru/dealer/dashboard" 
                       style="background: #ffa500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Просмотреть все отзывы
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    Это автоматическое уведомление от VELES DRIVE.<br>
                    Отзывы помогают улучшить ваш рейтинг и привлечь больше клиентов.
                </p>
            </div>
        </body>
        </html>
        """

        return await self.send_email(dealer_email, subject, html_content)

    async def send_vehicle_inquiry_notification(
        self,
        dealer_email: str,
        dealer_name: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        vehicle_info: Dict[str, Any],
        inquiry_message: str
    ) -> bool:
        """Send notification about vehicle inquiry"""
        subject = f"Запрос по автомобилю {vehicle_info.get('make', '')} {vehicle_info.get('model', '')} - VELES DRIVE"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">VELES DRIVE</h1>
                <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Премиум автомобили</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Здравствуйте, {dealer_name}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Новый запрос по вашему автомобилю:
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffa500; margin: 20px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #ffa500;">
                        {vehicle_info.get('make', '')} {vehicle_info.get('model', '')} {vehicle_info.get('year', '')}
                    </h3>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                        {vehicle_info.get('price_formatted', 'По запросу')}
                    </p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Данные клиента:</h4>
                    <p style="margin: 5px 0;"><strong>Имя:</strong> {customer_name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:{customer_email}" style="color: #ffa500;">{customer_email}</a></p>
                    <p style="margin: 5px 0;"><strong>Телефон:</strong> <a href="tel:{customer_phone}" style="color: #ffa500;">{customer_phone}</a></p>
                </div>
                
                {f'''
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Сообщение от клиента:</h4>
                    <p style="margin: 0; color: #666; font-style: italic;">"{inquiry_message}"</p>
                </div>
                ''' if inquiry_message else ''}
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:{customer_email}" 
                       style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 5px;">
                        Ответить по Email
                    </a>
                    <a href="tel:{customer_phone}" 
                       style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 5px;">
                        Позвонить клиенту
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    Это автоматическое уведомление от VELES DRIVE.<br>
                    Быстрый ответ клиентам повышает ваши продажи.
                </p>
            </div>
        </body>
        </html>
        """

        return await self.send_email(dealer_email, subject, html_content)

    async def send_welcome_email(
        self,
        user_email: str,
        user_name: str,
        user_role: str
    ) -> bool:
        """Send welcome email to new users"""
        role_text = "дилера" if user_role == "dealer" else "покупателя"
        subject = f"Добро пожаловать в VELES DRIVE!"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">VELES DRIVE</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Добро пожаловать в мир премиум автомобилей</p>
            </div>
            
            <div style="padding: 40px 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Здравствуйте, {user_name}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                    Спасибо за регистрацию на VELES DRIVE в качестве {role_text}! 
                    Вы присоединились к эксклюзивному сообществу любителей премиум автомобилей.
                </p>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin: 0 0 20px 0; color: #ffa500;">Что вас ждет:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #666;">
                        {"<li>Размещение автомобилей в каталоге</li><li>Общение с покупателями через встроенный чат</li><li>Управление профилем дилера и рейтингом</li><li>Аналитика продаж и просмотров</li>" if user_role == "dealer" else "<li>Просмотр эксклюзивного каталога автомобилей</li><li>Прямое общение с проверенными дилерами</li><li>Сохранение автомобилей в избранное</li><li>Сравнение характеристик автомобилей</li>"}
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://velesdrive.ru/catalog" 
                       style="background: #ffa500; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Начать просмотр
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    Если у вас есть вопросы, свяжитесь с нами:<br>
                    📧 support@velesdrive.ru | 📞 +7 (495) 123-45-67
                </p>
            </div>
        </body>
        </html>
        """

        return await self.send_email(user_email, subject, html_content)

# Create singleton instance
email_service = EmailService()