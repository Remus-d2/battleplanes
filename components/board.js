import React, { useEffect, useReducer } from "react";
import "./board.css";
import { useTable } from "react-table";
import styled from "styled-components";

let gridN = 5;

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function ReactTable(data) {
  const columns = [
    {
      Header: "Score table",
      columns: [
        {
          Header: "Date",
          accessor: "startGameDate"
        },
        {
          Header: "Result",
          accessor: "result"
        },
        {
          Header: "Shots",
          accessor: "shots"
        },
        {
          Header: "Duration",
          accessor: "duration"
        }
      ]
    }
  ];
  if (data.length > 0) {
    console.log("DATA:");
    console.log(data);
    data = data.map((el) => {
      return {
        ...el,
        startGameDate: new Date(el.startGameDate).toLocaleDateString()
      };
    });
    data.sort(function (a, b) {
      return b.moves - a.moves;
    });
  }
  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  );
}

function getDuration(dateFuture, dateNow) {
  var seconds = Math.floor((dateFuture - dateNow) / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);

  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;
  seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
}

function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function reducer(state, action) {
  switch (action.type) {
    case "selected":
      console.log(action);
      if (state.result === "won") return state;
      if (!state.hasOwnProperty("startGameDate")) {
        state.startGameDate = new Date();
      }
      if (
        action.i === state.computerPlane.i &&
        action.j === state.computerPlane.j
      ) {
        return {
          ...state,
          result: "won",
          shots: state.shots + 1,
          history: [
            ...state.history,
            {
              startGameDate: state.startGameDate,
              endGameDate: new Date(),
              result: "Won",
              shots: state.shots,
              duration: getDuration(new Date(), state.startGameDate)
            }
          ]
        };
      } else if (
        action.i !== state.computerPlane.i ||
        action.j !== state.computerPlane.j
      ) {
        return {
          ...state,
          missed: "miss",
          shots: state.shots + 1,
          shotsArr: [
            ...state.shotsArr,
            {
              i: action.i,
              j: action.j
            }
          ]
        };
      }
      return state;
    case "replay":
      return {
        hasStarted: false,
        score: 0,
        shots: 0,
        gridN: gridN,
        shotsArr: [],
        history: [...state.history],
        result: null,
        computerPlane: {
          i: parseInt(Math.random() * gridN),
          j: parseInt(Math.random() * gridN)
        }
      };
    default:
      return state;
  }
}

const Board = () => {
  const [state, dispatch] = useReducer(reducer, {
    hasStarted: false,
    score: 0,
    shots: 0,
    gridN: gridN,
    shotsArr: [],
    history: JSON.parse(localStorage.getItem("planes10")) || [],
    result: null,
    computerPlane: {
      i: parseInt(Math.random() * gridN),
      j: parseInt(Math.random() * gridN)
    }
  });
  useEffect(() => {
    localStorage.setItem("planes10", JSON.stringify(state.history));
  }, [state.history.length]);

  return (
    <>
      <div id="gameboard">
        {[...Array(state.gridN).keys()].map((i, index) => (
          <div key={Math.random() * 1000000}>
            {[...Array(state.gridN).keys()].map((j, index) => (
              <div
                key={Math.random() * 1000000}
                className={`tile ${
                  state.computerPlane.i === i && state.computerPlane.j === j
                    ? "computerplane"
                    : ""
                }
            ${
              state.shotsArr.some((el) => el.i === i && el.j === j)
                ? "shot"
                : ""
            }
            ${
              state.result === "won" &&
              i === state.computerPlane.i &&
              j === state.computerPlane.j
                ? "destroyed"
                : ""
            }
            `}
                key={Math.random() * 1000000}
                onClick={() => {
                  dispatch({
                    type: "selected",
                    i,
                    j
                  });
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className="announcement__box">
        {state.result === "won" && (
          <div>
            <h2>You win!</h2>
            <button
              onClick={() =>
                dispatch({
                  type: "replay"
                })
              }
            >
              Play again!
            </button>
          </div>
        )}
        {state.missed === "miss" &&
          state.result !== "won" &&
          state.shots !== 0 && <h2>Missed! Hit another.</h2>}
      </div>
      {ReactTable(state.history)}
    </>
  );
};

export default Board;
