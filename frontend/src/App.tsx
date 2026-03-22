import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// тип одной транзакции 
type Transaction = {
  amount: number;             // сумма расхода 
  description: string;        // описание - чел сам пишет "закрыл счет в рестике"
  category: string;           // перечень категорий, где юзер сам выбирает категорию
};

function App() {
  const [balance, setBalance] = useState(() => {    // Зачисление баланас - пока 1к по дефолту 
    const saved = localStorage.getItem("balance");
    return saved ? Number(saved) : 1000;            // Выбор количества $
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {       //список всех транзакций
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [amount, setAmount] = useState("");                 // Хранение ввода (данных) юзера 
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");         // по дефу еда 
  const [income, setIncome] = useState("");                 // сумма для пополнения баланса 

  useEffect(() => {
    localStorage.setItem("balance", balance.toString());
    localStorage.setItem("transactions", JSON.stringify(transactions));     // Сохраняем в локальное хранилище 
  }, [balance, transactions]);

  const addExpense = () => {
    const value = Number(amount);       // Функция добавления нового расхода 
  
    if (!value || value <= 0 || description.trim() === "" || !category) return;      // Проверка на ввод (нельзя пустое значение или ноль + нельзя оставить пустую категорию) 
    

    const newTransaction = {          // Создаем новую транзакцию 
      amount: value,
      description: description,
      category: category,
    };

    setTransactions([newTransaction, ...transactions]); // Добавляем в начало списка (самые свежие сверху)
    
    setBalance(balance - value);                         // Уменьаем баланс 

    setAmount("");                                       // Очистка input полей 
    setDescription("");
  };

  const addIncome = () => {
    const value = Number(income);

    if (!value || value <= 0) return;

    const newTransaction = {
      amount: value,
      description: "Пополнение",
      category: "income",
    };

    setTransactions([newTransaction, ...transactions]);
    setBalance(balance + value);

    setIncome("");
  };

  // Группируем расходы по категориям
const data = Object.values(
  transactions
    .filter((t) => t.category !== "income")
    .reduce((acc: any, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { name: t.category, value: 0 };
      }
      acc[t.category].value += t.amount;
      return acc;
    }, {})
);

// Цвета для диаграммы
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#2ecc71"];

  return (                                                                                      // ГЛАНВЫЙ RETURN ДО UI
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>MoneyQuest 💰</h1>

      {/* Баланс */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 10,
          background: "#f5f5f5",
        }}
      >
        <h2>Баланс</h2>
        <h1>{balance} €</h1>
      </div>

      {/* Ввод */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Описание (еда, такси...)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10,
            width: "100%",
          }}
        />

        

        {/* Категория */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10,
            width: "100%",
          }}
        >
          <option value="food">🍔 Еда</option>
          <option value="transport">🚕 Транспорт</option>
          <option value="fun">🎮 Развлечения</option>
        </select>

        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginRight: 10,
          }}
        />

        <button
          onClick={addExpense}
          style={{
            padding: "10px 16px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          Добавить
        </button>
      </div>

      {/* Пополнение баланса */}
      <div style={{ marginTop: 20 }}>
        <input
          type="number"
          placeholder="Сумма пополнения"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginRight: 10,
          }}
        />

        <button
          onClick={addIncome}
          style={{
            padding: "10px 16px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: "#2196F3",
            color: "white",
            cursor: "pointer",
          }}
        >
          Пополнить
        </button>
      </div>

      {/* Диаграмма расходов */}
      <div style={{ marginTop: 30 }}>
        <h3>Расходы по категориям</h3>

        {data.length === 0 ? (
          <p>Нет данных</p>
        ) : (
          <PieChart width={300} height={300}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ percent }) =>
                `${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
          </Pie>
          <Tooltip />
          <Legend />
          </PieChart>
        )}
      </div>

      {/* Список */}
      <div style={{ marginTop: 30 }}>
        <h3>Последние операции</h3>

        {transactions.length === 0 ? (
          <p>Пока пусто...</p>
        ) : (
          transactions.map((t, index) => (
            <div
              key={index}
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                background: "#f9f9f9",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {t.description} ({t.category})
              </span>

              <span
                style={{
                  color: t.category === "income" ? "#2ecc71" : "#e74c3c",
                  fontWeight: "bold",
                }}
              >
                {t.category === "income" ? "+" : "-"}{t.amount} €
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;



// deploy trigger 02