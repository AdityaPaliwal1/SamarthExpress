import {Client , Account} from 'appwrite';

const client = new Client()
.setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
.setProject('67932280002233c059c8') ;

export const account  = new Account(client);

