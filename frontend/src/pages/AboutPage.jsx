import React from 'react';
import { Users, Award, Shield, TrendingUp, Car, Star, CheckCircle } from 'lucide-react';
import { FadeInUp } from '../components/Animations/FadeInUp';

export const AboutPage = () => {
  const stats = [
    { value: '2015', label: 'Год основания', icon: Award },
    { value: '15,000+', label: 'Довольных клиентов', icon: Users },
    { value: '500+', label: 'Автомобилей в месяц', icon: Car },
    { value: '4.9', label: 'Рейтинг клиентов', icon: Star }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Надежность',
      description: 'Каждый автомобиль проходит тщательную проверку. Мы гарантируем юридическую чистоту и техническое состояние.'
    },
    {
      icon: Star,
      title: 'Качество',
      description: 'Работаем только с премиум автомобилями от проверенных дилеров. Высочайшие стандарты обслуживания.'
    },
    {
      icon: Users,
      title: 'Клиентоориентированность',
      description: 'Индивидуальный подход к каждому клиенту. Помогаем найти идеальный автомобиль под ваши потребности.'
    },
    {
      icon: TrendingUp,
      title: 'Инновации',
      description: 'Используем современные технологии для удобства клиентов: онлайн-просмотры, виртуальные туры, AI-рекомендации.'
    }
  ];

  const team = [
    {
      name: 'Александр Велесов',
      position: 'Генеральный директор',
      description: 'Более 15 лет в автомобильной индустрии. Эксперт по премиум сегменту.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=300&h=300&fit=crop'
    },
    {
      name: 'Елена Драйвер',
      position: 'Директор по продажам',
      description: 'Специалист по работе с VIP-клиентами. Знает все о роскошных автомобилях.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=300&h=300&fit=crop'
    },
    {
      name: 'Михаил Премиум',
      position: 'Технический директор',
      description: 'Эксперт по диагностике и оценке технического состояния автомобилей.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=300&h=300&fit=crop'
    }
  ];

  const achievements = [
    'Лидер рынка премиум автомобилей в Москве',
    'Партнер официальных дилеров Mercedes-Benz, BMW, Audi',
    'Более 50 000 успешных сделок',
    'Сертификат качества ISO 9001',
    'Победитель премии "Лучший автосалон года" 2023',
    'Рейтинг А+ от агентства "Автостат"'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                О компании VELES DRIVE
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Ведущая платформа для покупки и продажи премиум автомобилей в России
              </p>
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                С 2015 года мы помогаем клиентам найти автомобиль мечты, предоставляя 
                безопасные сделки, прозрачные условия и исключительное качество обслуживания.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeInUp>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Наша миссия
                  </h2>
                  <p className="text-xl text-gray-600 mb-6">
                    Сделать покупку и продажу премиум автомобилей максимально простой, 
                    безопасной и прозрачной для каждого клиента.
                  </p>
                  <p className="text-gray-600 mb-8">
                    Мы верим, что каждый человек заслуживает автомобиль своей мечты, 
                    и наша задача - помочь воплотить эту мечту в реальность, предоставив 
                    все необходимые услуги и гарантии качества.
                  </p>
                  <div className="space-y-4">
                    {achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=600&h=400&fit=crop"
                    alt="Офис VELES DRIVE"
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Наши ценности
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Принципы, которыми мы руководствуемся в работе
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Наша команда
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Профессионалы с многолетним опытом в автомобильной индустрии
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-gray-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="relative mb-6">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 font-semibold mb-4">
                    {member.position}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-red-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Наши достижения
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Результаты нашей работы говорят сами за себя
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {achievements.map((achievement, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                    <span className="font-medium">{achievement}</span>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                История компании
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Путь от стартапа до лидера рынка премиум автомобилей
              </p>
            </div>
          </FadeInUp>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <FadeInUp delay={0.1}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/3">
                    <div className="text-4xl font-bold text-orange-600 mb-2">2015</div>
                    <div className="text-xl font-semibold text-gray-900">Основание</div>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-gray-600 leading-relaxed">
                      Александр Велесов основал VELES DRIVE с целью создать премиум платформу 
                      для продажи роскошных автомобилей. Первый офис открылся в центре Москвы.
                    </p>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/3">
                    <div className="text-4xl font-bold text-orange-600 mb-2">2018</div>
                    <div className="text-xl font-semibold text-gray-900">Рост</div>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-gray-600 leading-relaxed">
                      Заключены партнерские соглашения с официальными дилерами Mercedes-Benz, BMW и Audi. 
                      Запущена онлайн-платформа для удобства клиентов.
                    </p>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/3">
                    <div className="text-4xl font-bold text-orange-600 mb-2">2021</div>
                    <div className="text-xl font-semibold text-gray-900">Инновации</div>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-gray-600 leading-relaxed">
                      Внедрение AI-технологий для персональных рекомендаций. Запуск сервисов 
                      виртуальных туров и онлайн-консультаций.
                    </p>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/3">
                    <div className="text-4xl font-bold text-orange-600 mb-2">2024</div>
                    <div className="text-xl font-semibold text-gray-900">Лидерство</div>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-gray-600 leading-relaxed">
                      VELES DRIVE становится №1 в сегменте премиум автомобилей в России. 
                      Более 15,000 довольных клиентов и 500+ автомобилей в месяц.
                    </p>
                  </div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};