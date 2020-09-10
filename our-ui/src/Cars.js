import React from "react";
import styles from "./Cars.module.css";
import { useFetch } from "react-async";

//
// https://github.com/async-library/react-async/blob/24889242c46649db186321170d0f3e9246476526/packages/react-async/src/useAsync.tsx#L285-L297

export function Cars() {
  const { data: dataGetAll, status: statusGetAll, reload: reloadGetAll } = useFetch('http://localhost:8080/cars', {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }, { json: true });

  const { run: runPost, data: dataPost, status: statusPost } = useFetch('http://localhost:8080/cars', {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, { json: true });

  const [postResponse, setPostRequest] = React.useState();
  const [postResponseStatus, setPostRequestStatus] = React.useState("initial");

  function onFormSubmit(event) {
    event.preventDefault();


    setPostRequestStatus("pending")
    fetch("http://localhost:8080/cars", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }).then((response) => {
      return response.json();
    }).then((data) => {
      setPostRequest(data)
      setPostRequestStatus("fulfilled");
    });

    // runPost({
    //   body: JSON.stringify(Object.fromEntries(new FormData(event.target)))
    // });
  }

  React.useEffect(() => {
    if (postResponseStatus === "fulfilled") {
      reloadGetAll();
      console.log("reloading get");
    } else {
      console.log("not reloading get");
    }
  }, [reloadGetAll, postResponseStatus]);

  const currentYear = (new Date()).getFullYear();

  return <div>
    <p>status: {postResponseStatus}</p>
    {/* <pre style={{ textAlign: "left" }}>
      {JSON.stringify(dataPost, null, 2)}
    </pre> */}
    <h2>Cars</h2>
    <form className={styles.carAddForm} onSubmit={onFormSubmit}>
        <div>Year: <input required type="number" min={currentYear - 50} max={currentYear + 1} name="year" /></div>
        <div>Model: <input required type="string" name="model" /></div>
        <div>Manufacture: <input required type="string" name="manufacture" /></div>
        <button>Add Car</button>
    </form>
    {(() => {
      if (!dataGetAll) {
        return;
      }

      const arr = dataGetAll.map((car, index) => <li key={index}>
        {car.model}:{car.year}:{car.manufacture}
      </li>);

      const list = <ul>{
        arr
      }</ul>;

      return list;
    })()}
  </div>;
}
