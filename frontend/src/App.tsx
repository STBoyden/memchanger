import { useState } from "react";
import "./App.css";
import { GetAllRunningProcesses } from "../wailsjs/go/main/App";
import { useEffect } from "react";

function App() {
  const [resultText, setResultText] = useState(
    "Please enter your name below 👇",
  );
  const [processes, setProcesses] = useState<string[]>([]);

  useEffect(() => {
    const getRunningProcesses = async () => {
      const processes = await GetAllRunningProcesses();
      setProcesses(processes);
    };

    getRunningProcesses();
  }, []);

  return (
    <div>
      {processes.map((process, index) => {
        return (
          <div key={index} className="process">
            {process}
          </div>
        );
      })}
    </div>
  );
}

export default App;
