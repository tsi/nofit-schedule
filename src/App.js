import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import Links from './Links';
import { initGapiClient } from './gapiUtils';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [who, setWho] = useState(localStorage.getItem('who') || 0);

  useEffect(() => {
    window.gapi.load("client", () => initGapiClient(setData))
  }, []);

  const handleChange = (e) => {
    setWho(e.target.value);
    localStorage.setItem('who', e.target.value);
  }

  // console.log(data);

  return (
    <div className="App">
      <header>
        <div className="container">
          <div className="selector">
            <span>שיעורים מתאימים ל:</span>
            <select value={who} onChange={handleChange}>
              <option value="0" >כולם</option>
              <option value="1" >א</option>
              <option value="2" >ב</option>
              <option value="3" >ג</option>
              <option value="4" >ד</option>
            </select>
          </div>
          <Links />
        </div>
      </header>
      <h1>מערכת שעות - מסלול דמוקרטי בנופית</h1>
      <div className="container">
        {data ? (
          <table border='0' cellPadding='0' cellSpacing='0'>
            <thead>
              <tr className="days">
                <th></th>
                {data.days.map(day => (
                  <th key={day || 'empty'}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.hours.map(hour => (
                <tr key={hour || 'empty'}>
                  <td className="time">{hour}</td>
                  {data.days.map(day => (
                    <td key={day}>
                      {data.schedule[day][hour].map((name, i) => {
                        const lesson = data.lessons[name];
                        if (!lesson) return null;
                        const inWho = lesson && lesson.who.includes(parseInt(who)) ? true : false;
                        const color = lesson.color || (Object.keys(data.lessons).indexOf(name) % 15) + 1
                        return parseInt(who) === 0 || inWho ? (
                          <div key={name + i} className={'lesson color-' + color} data-tooltip={lesson.tooltip ? lesson.tooltip : null}>
                            {lesson.link ? (
                              <a href={lesson.link} target="_blank" rel="noopener noreferrer">{name}</a>
                            ) : name }
                          </div>
                        ) : null
                      })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="logo-wrp"><img src={logo} className="App-logo" alt="logo" /></div>
        )}
      </div>
    </div>
  );
}

export default App;
