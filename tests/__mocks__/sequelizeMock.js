const SequelizeMock = require('sequelize-mock');

// --- Используем DataTypes из SequelizeMock ---
const DataTypes = SequelizeMock.DataTypes;

// Создаем экземпляр SequelizeMock
const sequelizeInstance = new SequelizeMock();

// --- Список стандартных методов Sequelize моделей, которые мы хотим мокировать ---
// SequelizeMock.define обычно добавляет их.
// Мы будем их добавлять к нашим mock-моделям.
const MODEL_METHODS = [
  'create', 'findAll', 'findByPk', 'findOne', 'update', 'destroy', 'bulkCreate',
  // Добавьте другие, если они используются
];

// --- Мокируем сам метод define ---
const defineMock = jest.fn((modelName, attributes, options) => {
  // --- Шаг 1: Создаем структуру `processedAttributes` с нашим желаемым форматом типов ---
  const processedAttributes = {};
  for (const attrName in attributes) {
    const attr = attributes[attrName];
    let processedType = attr.type; // Это то, что было передано из user.js (например, DataTypes.STRING)

    // --- Преобразуем attr.type в { key: '...' } ---
    if (typeof processedType === 'function') {
      // Предполагаем, что функция типа имеет свойство 'key' или 'name'
      const typeKey = processedType.key || processedType.name;
      if (typeKey) {
        processedType = { key: typeKey };
      } else {
        processedType = { key: 'UNKNOWN_FUNCTION_TYPE' };
      }
    } else if (typeof processedType === 'object' && processedType !== null && processedType.key) {
      // Уже в нужном формате
    } else if (typeof processedType === 'string') {
      processedType = { key: processedType };
    } else {
      processedType = { key: 'UNKNOWN_TYPE' };
    }
    
    processedAttributes[attrName] = {
      ...attr,
      type: processedType, // Применяем обработанный тип
    };
  }

  // --- Шаг 2: Создаем "пустой" mock-объект модели ---
  // Вместо вызова sequelizeInstance.define(), мы создаем свою структуру.
  const mockModel = {
    name: modelName,
    rawAttributes: processedAttributes, // Устанавливаем наши обработанные атрибуты
    options: options,
    // Associations: {}, // Если нужны ассоциации
  };

  // --- Шаг 3: Добавляем стандартные методы Sequelize ---
  // Это важно, чтобы тесты могли проверять typeof User.create и т.д.
  MODEL_METHODS.forEach(methodName => {
    // Для каждого метода создаем Jest mock-функцию.
    // Можно также использовать dummy-реализации из sequelizeInstance, если они нужны.
    mockModel[methodName] = jest.fn(); 
    
  
  return mockModel;
});

// --- Объект мока Sequelize ---
const mockSequelize = {
  // Не копируем sequelizeInstance, так как мы сами строим mock-объект
  // ...sequelizeInstance, 
  DataTypes: DataTypes, // Используем DataTypes из SequelizeMock
  define: defineMock,
  // Если вашему коду нужен `sequelize.sync()` или другие методы на самом экземпляре sequelize,
  // их тоже нужно мокировать здесь.
  sync: jest.fn().mockResolvedValue(undefined), // Пример мока sync
};

module.exports = mockSequelize;