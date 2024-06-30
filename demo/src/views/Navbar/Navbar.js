import React from "react";
import styles from "./Navbar.module.css";
import navbarData from "../../data/navbarData.json";
import logo from "../../assets/header_logo.svg";
import githubLogo from "../../assets/github-mark.svg";

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <div>
        <img src={logo} className={styles.logo} alt="Rocket.Chat" />
      </div>

      <div className={styles.navLinkContainer}>
        {navbarData.links.map((link, index) => (
          <a key={index} className={styles.navLink} href={link.href}>
            <span>
              {link.text}{" "}
              {link.imgAlt && <img src={githubLogo} alt={link.imgAlt} />}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Navbar;

