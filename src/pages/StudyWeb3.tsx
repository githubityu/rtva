import {useAppStore} from "../stores/useAppStore.ts";
import {Button, Space, Typography} from "antd";
import Title from "antd/lib/typography/Title";
import {useNavigate} from "react-router-dom";
import {APP_ROUTES} from "../constants/routes.ts";
import {useCallback, useEffect} from "react";
import {EVENT_NAMES, eventBus} from "../utils/eventBus.ts";

const {Text} = Typography;
export default function StudyWeb3() {
    const count = useAppStore((state) => state.count);
    const increment = useAppStore((state) => state.increment);


    const testEvent = useCallback(() => {
        eventBus.emit(EVENT_NAMES.TEST_EVENT, {
            name: 'My Test yu', // 2. payload 的类型会被自动检查！
            count: 1,       //    如果你写错 `count` 为字符串，TS会报错
        });
    }, []);


    return (
        <Space style={{backgroundColor: 'white'}} direction="vertical">
            <Title>Study Web3</Title>
            <Text>Count: {count}</Text>
            <Button onClick={() => increment()}>Increment</Button>
            <StudyWeb4 testEvent={testEvent}/>
        </Space>
    );
}


function StudyWeb4(props: { testEvent: () => void }) {
    const count = useAppStore((state) => state.count);
    const navigate = useNavigate();

    useEffect(() => {
        return eventBus.on(EVENT_NAMES.TEST_EVENT, (payload) => {
            // 1. `payload` 被自动推断为 { name: string; count: number }
            //    你可以安全地访问 payload.name 和 payload.count，并获得类型提示
            console.log(`Received test event: ${payload.name} with count ${payload.count}`);
        });
    }, []);

    return (
        <div>
            <Title>StudyWeb4</Title>
            <Text>Count: {count}</Text>
            <Button onClick={() => {
                navigate(APP_ROUTES.STUDY_ANTD)
            }}>go to study antd</Button>
            <Button onClick={() => {
                props.testEvent()
            }}>use testEvent</Button>
        </div>
    );
}
