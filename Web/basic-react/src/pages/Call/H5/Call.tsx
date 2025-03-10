import { useContext, useState } from "react"
import { useNavigate, useLocation } from 'react-router-dom';
import { Image, Flex, Input } from 'antd';
import { TUICallKitServer, TUICallType } from '@tencentcloud/call-uikit-react';
import { checkUserID, trim } from '../../../utils';
import { UserInfoContext } from "../../../context";
import { useLanguage, useAegis, useMessage } from '../../../hooks';
import ReturnH5Svg from '../../../assets/pages/h5-return.svg';
import './Call.css';

export default function Call() {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useLanguage();
  const [calleeUserID, setCalleeUserID] = useState('');
  const { messageApi, contextHolder, handleCallError } = useMessage();
  const { reportEvent } = useAegis();

  const goHome = () => {
    navigate('/home');
  }

  const handleCall = async () => {
    reportEvent({ apiName: 'call.start' });
    if (!checkUserID(calleeUserID)) {
      messageApi.info(t('Please input the correct userID'));
      setCalleeUserID('');
      return;
    }
    if (calleeUserID === userInfo.userID) {
      messageApi.info(t('You cannot make a call to yourself'));
      setCalleeUserID('');
      return;
    }
    setUserInfo({
      ...userInfo,
      isCall: true,
    });

    try {
      await TUICallKitServer.calls({
        userIDList: [calleeUserID],
        type: state.callType === 'video' ? TUICallType.VIDEO_CALL : TUICallType.AUDIO_CALL,
      })
      reportEvent({ apiName: 'call.success' });
      setCalleeUserID('');
    } catch (error: any) {
      setUserInfo({
        ...userInfo,
        isCall: false,
      });
      handleCallError('call', error);
    }
  }

  const handleCallUserID = (event: any) => {
    const userID = trim(event.target.value);
    setCalleeUserID(userID);
  }
  
  return (
    <>
      {contextHolder}
      <Flex className="call-h5-panel" vertical={true}>
        <Flex className="call-h5-bar" align="center">
          <Image src={ReturnH5Svg} width='10px' preview={false} className="h5-call-img" onClick={goHome} />
          <span className="h5-call-text"> {t('1v1 Call')} </span>
        </Flex>
        <Input 
          className="h5-call-input"
          prefix='userID'
          placeholder={t('input the userID to Call')}
          value={calleeUserID} 
          onChange={handleCallUserID}
          onPressEnter={handleCall}
        />
        <div className="h5-call-btn" onClick={handleCall}> {t('Initiate Call')} </div>
      </Flex>
    </>
  )
}