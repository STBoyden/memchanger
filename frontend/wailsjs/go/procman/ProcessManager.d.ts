// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {procman} from '../models';
import {context} from '../models';

export function GetProcessIDs():Promise<Array<number>>;

export function GetProcessInformation(arg1:number):Promise<procman.ProcessInformation>;

export function SetContext(arg1:context.Context):Promise<void>;
