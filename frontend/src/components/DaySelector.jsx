import { useState, useEffect } from 'react';

function DaySelector({ selectedDate: propSelectedDate, onDateChange }) {
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());
  const [weekDays, setWeekDays] = useState([]);

  // Sincronizar com prop externa
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  // Gera os dias da semana atual
  useEffect(() => {
    generateWeekDays(selectedDate);
  }, [selectedDate]);

  const generateWeekDays = (date) => {
    const currentDay = date.getDay(); // 0 = Domingo, 6 = Sábado
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay); // Volta para o domingo da semana

    const days = [];
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        abbr: dayNames[i],
        day: day.getDate(),
        fullDate: day,
        isToday: day.toDateString() === new Date().toDateString(),
      });
    }

    setWeekDays(days);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day.fullDate);
    if (onDateChange) {
      onDateChange(day.fullDate);
    }
  };

  return (
    <section className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between min-w-[600px] gap-2 p-1 bg-surface/50 rounded-2xl border border-border-color">
        <button
          onClick={handlePrevWeek}
          className="p-2 text-text-secondary hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <div className="flex flex-1 justify-between gap-2 px-2">
          {weekDays.map((item, index) => {
            const isSelected = item.fullDate.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(item)}
                className={`flex flex-col items-center justify-center w-14 py-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary shadow-[0_0_15px_rgba(163,230,53,0.3)] transform scale-105'
                    : 'group hover:bg-slate-700'
                }`}
              >
                <span
                  className={`text-xs font-medium mb-1 ${
                    isSelected
                      ? 'text-slate-900 font-extrabold'
                      : 'text-text-secondary'
                  }`}
                >
                  {item.abbr}
                </span>
                <span
                  className={`font-bold relative ${
                    isSelected
                      ? 'text-xl text-slate-900 font-black'
                      : 'text-lg text-text-secondary group-hover:text-white'
                  }`}
                >
                  {item.day}
                  {item.isToday && !isSelected && (
                    <span className="absolute -top-1 -right-1 size-1.5 bg-primary rounded-full"></span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 text-text-secondary hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  );
}

export default DaySelector;
