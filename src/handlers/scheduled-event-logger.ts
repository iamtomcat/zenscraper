import { CloudWatchLogsEvent, Context, EventBridgeEvent } from "aws-lambda";

import { main } from "../main";

/**
 * A Lambda function that logs the payload received from a CloudWatch scheduled event.
 */
exports.scheduledEventLoggerHandler = async (event: EventBridgeEvent<string, {}>, context: Context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.info(JSON.stringify(event));

    await main();
}
