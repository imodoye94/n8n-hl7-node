import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

const hl7v2 = require('@ehr/hl7-v2');

export class HL7Node implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'HL7 Node',
    name: 'hl7Node',
    icon: 'file:hl7Node.png',
    group: ['transform'],
    version: 1,
    description: 'Parse JSON to HL7 and generate HL7 messages from JSON',
    defaults: {
      name: 'HL7 Node',
      color: '#551EB7B3',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Parse',
            value: 'parse',
            action: 'Parse HL7v2 message',
            description: 'Parse an HL7v2 message into a JSON output',
          },
          {
            name: 'Generate',
            value: 'generate',
            action: 'Generate HL7v2 message',
            description: 'Generate HL7v2 message from a structured JSON input',
          },
        ],
        default: 'parse',
        description: 'The operation to perform.',
        noDataExpression: true,
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        description: 'The HL7 message to parse or the JSON to generate an HL7 message.',
        noDataExpression: false,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;
      const message = this.getNodeParameter('message', i) as string;

      try {
        if (operation === 'parse') {
          const parser = new hl7v2.Parser();
          const json = parser.parse(message);
          returnData.push({ json });
        } else if (operation === 'generate') {
          const generator = new hl7v2.Generator();
          const hl7 = generator.write(JSON.parse(message));
          returnData.push({ json: { hl7 } });
        }
      } catch (error) {
        throw new NodeOperationError(this.getNode(), error.toString(), { itemIndex: i });
      }
    }

    return [returnData];
  }
}
