import { EmbeddedChat } from "ec-test";
import StormySeas from "../../theme/StormySeas";
import styles from "./EmbeddedChat.module.css";

const ECComponent = ({ isEcOpen, setIsECOpen }) => {
  return (
    <div className={styles.ecContainer}>
      <EmbeddedChat
        host="https://spiral-memory.rocket.chat"
        roomId="6679b390ef5048f098b06d48"
        anonymousMode
        theme={StormySeas}
        height="85vh"
        width="55vw"
        auth={{
          flow: "TOKEN",
          credentials: {
            resume: "czWwA8NzkBkch7lzl3G-yc6Pm5Gqco9PBf-mu4CyLqk",
          },
        }}
        isClosable={true}
        setClosableState={() => {
          isEcOpen && setIsECOpen((prev) => !prev);
        }}
      />
    </div>
  );
};

export default ECComponent;
