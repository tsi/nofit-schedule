
export const initGapiClient = (setData) => {
  // Initialize the JavaScript client library.
  window.gapi.client
    .init({
      apiKey: process.env.REACT_APP_API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    })
    .then(() => {
      // Initialize and make the API request.
      getData(setData);
    });
};

export const getData = (setData) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .batchGet({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        ranges: ["'מערכת'!B2:H", "'תכנים'!A1:H"]
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

export const parseData = (data) => {
  // console.log(data);
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
            tooltip: lesson[6],
            color: lesson[7]
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
