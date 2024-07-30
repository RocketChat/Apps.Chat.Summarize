import { EmbeddedChat } from 'ec-test';
import StormySeas from '../../theme/StormySeas';
import styles from './EmbeddedChat.module.css';

const ECComponent = ({ isEcOpen, setIsECOpen }) => {
  return (
    <div className={styles.ecContainer}>
      <EmbeddedChat
        host="https://demo.qa.rocket.chat"
        roomId="669fd7388129fb4346981692"
        anonymousMode
        theme={StormySeas}
        height="85vh"
        width="55vw"
        auth={{
          flow: 'TOKEN',
          credentials: {
            resume: 'RXINgch72chNT_3WRyXWeUJXR9phnUQdP5RVyVvicvd',
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
