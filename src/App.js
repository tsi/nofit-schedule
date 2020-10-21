import React, { useEffect, useState } from 'react';
import config from './config';
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
          majorDimension: 'COLUMNS',
          ranges: ["'מערכת 2'!B2:H", "'תכנים'!A1:E"]
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
    return data;
  }

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    window.gapi.load("client", () => initGapiClient(setData))
  }, []);

  console.log(data);

  return (
    <div className="App">
      <h1>data from google sheets</h1>
      <ul>
        {/* {data.map((item, i) => (
          <li key={i}>
            <div>URL -- {item.URL}</div>
            <div>Email - {item.email}</div>
            <div>Token - {item.token}</div>
            <br />
          </li>
        ))} */}
      </ul>
    </div>
  );
}

export default App;
