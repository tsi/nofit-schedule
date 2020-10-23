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
        // majorDimension: 'COLUMNS',
        ranges: ["'מערכת'!B2:H", "'תכנים'!A1:E"]
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
        const who = data[1].values.find(l => l[0] === name);
        if (who) {
          who.shift();
          lessons[name] = {
            label: name,
            who: who.map((val, i) => val === 'TRUE' ? i + 1 : false)
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

  return (
    <div className="App container">
      {data && (
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
      )}
      {data ? (
        <table border='0' cellPadding='0' cellSpacing='0'>
          <thead>
            <tr className="days">
              <th></th>
              {data.days.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.hours.map(hour => (
              <tr key={hour}>
                <td className="time">{hour}</td>
                {data.days.map(day => (
                  <td key={day}>
                    {data.schedule[day][hour].map(lesson => {
                      const inWho = data.lessons[lesson] && data.lessons[lesson].who.includes(parseInt(who)) ? true : false;
                      return parseInt(who) === 0 || inWho ? (
                        <div key={lesson} className={'lesson color-' + (Object.keys(data.lessons).indexOf(lesson) % 6)}>
                          {/* {console.log(data.lessons[lesson])} */}
                          {lesson}
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
          <img src={logo} className="App-logo" alt="logo" />
        )}
    </div>
  );
}

export default App;
