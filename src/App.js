import React, { useEffect, useState } from 'react';
import config from './config';
import logo from './logo.svg';
import './App.css';

const initGapiClient = (setData) => {
  // 2. Initialize the JavaScript client library.
  window.gapi.client
    .init({
      apiKey: config.apiKey,
      discoveryDocs: config.discoveryDocs,
    })
    .then(() => {
      // 3. Initialize and make the API request.
      getData(setData);
    });
};

const getData = (setData) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .batchGet({
        spreadsheetId: config.spreadsheetId,
        ranges: ["'מערכת'!B2:H", "'תכנים'!A1:G"]
      })
      .then(
        response => {
          const data = parseData(response.result.valueRanges);
          setData(data);
        },
        response => {
          console.error(response.result.error);
        }
      );
  });
}

const parseData = (data) => {
  console.log(data);
  const rowList = data[0].values;
  const days = data[0].values[0];
  const daysArr = [];
  const hoursList = [];
  const dayList = [];
  const lessons = {};
  for (let dayIdx = 1; dayIdx < days.length; dayIdx++) {
    const day = days[dayIdx];
    dayList.push(day);
    for (let rowIdx = 1; rowIdx < rowList.length; rowIdx++) {
      const time = rowList[rowIdx][0];
      const name = rowList[rowIdx][dayIdx];
      if (name && !lessons[name]) {
        const lesson = data[1].values.find(l => l[0] === name);
        if (lesson) {
          lessons[name] = {
            label: name,
            who: lesson.slice(1, 5).map((val, i) => val === 'TRUE' ? i + 1 : false),
            link: lesson[5],
            tooltip: lesson[6]
          }
        }
      }
      if (hoursList.indexOf(time) === -1) hoursList.push(time);
      daysArr[day] = daysArr[day] ? daysArr[day] : [];
      daysArr[day][time] = daysArr[day][time] ? daysArr[day][time] : [];
      daysArr[day][time].push(name);
    }
  }
  return {
    days: dayList,
    hours: hoursList,
    lessons: lessons,
    schedule: daysArr
  };
}

function App() {
  const [data, setData] = useState(null);
  const [who, setWho] = useState(0);

  useEffect(() => {
    window.gapi.load("client", () => initGapiClient(setData))
  }, []);

  const handleChange = (e) => {
    setWho(e.target.value);
  }

  console.log(data);

  return data ? (
    <div className="App container">
      <header>
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
        <h1>מערכת שעות - מסלול דמוקרטי בנופית</h1>
      </header>
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
                    return parseInt(who) === 0 || inWho ? (
                      <div key={name + i} className={'lesson color-' + (Object.keys(data.lessons).indexOf(name) % 6)} data-tooltip={lesson.tooltip ? lesson.tooltip : null}>
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
      <p>
        <span>לינקים: </span>
        <span>
          <a href="https://drive.google.com/drive/folders/1q_nmaCrEJy1qW_ypgAT6GVgyVyTw1sk1?usp=sharing">ספריית דרייב</a>
        </span>
        <span>&nbsp;| </span>
        <span>
          <a href="https://edu-il.zoom.us/j/4098147467%23success">זום חלי</a>
        </span>
        <span>&nbsp;| </span>
        <span>
          <a href="https://edu-il.zoom.us/j/4098147467%23success">זום עירית</a>
        </span>
        <span>&nbsp;| </span>
        <span>
          <a href="https://edu-il.zoom.us/j/4098147467%23success">זום שלהבת</a>
        </span>
      </p>
    </div>
  ) : (
    <img src={logo} className="App-logo" alt="logo" />
  );
}

export default App;
