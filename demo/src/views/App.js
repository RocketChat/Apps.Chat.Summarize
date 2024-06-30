import React, { useState } from "react";
import ECComponent from "./EmbeddedChat/EmbeddedChat";
import styles from "./App.module.css";
import Navbar from "./Navbar/Navbar";
import projectImage from "../assets/project_img.jpg";
import appData from "../data/appData.json";

function App() {
  const [isEcOpen, setIsECOpen] = useState(false);
  return (
    <div>
      <Navbar />
      <div className={styles.body}>
        <div className={styles.projectContainer}>
          <div className={styles.projectInfo}>
            <h1 className={styles.projectName}>{appData.projectName}</h1>
            <h2 className={styles.projectAbstract}>
              {appData.projectAbstract}
            </h2>
            <ol className={styles.alternatingColors}>
              {appData.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ol>
            <div className={styles.btnContainer}>
              <a className={styles.proposalBtn} href={appData.proposalLink}>
                View Proposal
              </a>
              <button
                className={styles.tryBtn}
                onClick={() => setIsECOpen((prev) => !prev)}
              >
                {isEcOpen ? "Close" : "Try Now!"}
              </button>
            </div>
          </div>

          <div className={styles.projectImageContainer}>
            <div className={styles.blankSquare} />
            <div className={styles.blankSquare2} />
            <img
              src={projectImage}
              alt={appData.projectName}
              className={styles.projectImage}
            />
          </div>
        </div>
      </div>
      {isEcOpen && (
        <ECComponent isEcOpen={isEcOpen} setIsECOpen={setIsECOpen} />
      )}
    </div>
  );
}

export default App;
