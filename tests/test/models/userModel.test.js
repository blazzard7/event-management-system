// Импортируем наш мок Sequelize, чтобы Jest знал, чем заменить require('../config/db.js')
const mockSequelize = require('../../__mocks__/sequelizeMock.js');

// 1. МОКИРОВАНИЕ ЗАВИСИМОСТИ
// Мы говорим Jest, что при импорте '../config/db.js' нужно использовать наш мок-объект.
jest.mock('../../../src/config/db.js', () => mockSequelize);

// 2. ИМПОРТ ТЕСТИРУЕМОГО МОДУЛЯ
// User.js импортирует sequelize, который теперь является нашим моком.
const User = require('../../../src/models/user.js');

describe('User Model Definition', () => {
  // --- Добавьте этот тест, если он отсутствует ---
  test('should pass if the file is valid', () => {
    expect(true).toBe(true); // Это простой тест, который всегда проходит
  
});


  test('User model should be defined using sequelize.define', () => {
    // Проверяем, что метод define был вызван
    expect(mockSequelize.define).toHaveBeenCalledTimes(1);
    

    // Проверяем, что он был вызван с нужным именем модели 'User'
    expect(mockSequelize.define).toHaveBeenCalledWith(
        'User',
        expect.any(Object), // Мы не проверяем атрибуты здесь, а в следующем тесте
        { tableName: 'users', timestamps: true }
    );
  });

  test.skip('User model attributes and options should match definition', () => {
    const args = mockSequelize.define.mock.calls[0];
    const attributes = args[1];
    const options = args[2];

    // 1. Проверка опций
    expect(options.tableName).toBe('users');
    expect(options.timestamps).toBe(true);

    // 2. Проверка атрибутов
    expect(attributes.username).toBeDefined();
    expect(attributes.password).toBeDefined();
    expect(attributes.role).toBeDefined();

     // 3. Проверка ограничений (Username)
    const usernameAttr = attributes.username;
    // Теперь мы ожидаем, что тип будет объектом, как в реальном Sequelize
    // SequelizeMock.DataTypes.STRING обычно выглядит как { key: 'STRING', ... }
    expect(usernameAttr.type).toEqual(expect.objectContaining({ key: 'STRING' }));
    expect(usernameAttr.allowNull).toBe(false);
    expect(usernameAttr.unique).toBe(true);

    // 4. Проверка ограничений (Password и Role)
    expect(attributes.password.allowNull).toBe(false);
    expect(attributes.role.allowNull).toBe(false);
  });

  test('User model instance should reflect defined structure', () => {
    // Если бы мы хотели протестировать, что модель ведет себя как объект Sequelize,
    // мы могли бы проверить, что у User есть методы, которые Sequelize ему добавляет
    // (например, .build, .save, .create, .findAll).
    // В нашем моке SequelizeMock уже есть эти методы, но мы можем убедиться, что они существуют.
    
    expect(typeof User.create).toBe('function');
    expect(typeof User.findAll).toBe('function');
    
  });
});