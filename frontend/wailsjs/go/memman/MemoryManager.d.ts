// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {memman} from '../models';
import {procman} from '../models';
import {context} from '../models';

export function GetHeapAddressRange():Promise<memman.AddressRange>;

export function LoadProcess(arg1:procman.ProcessInformation):Promise<void>;

export function ReadMemory(arg1:number,arg2:number):Promise<Array<number>>;

export function SetContext(arg1:context.Context):Promise<void>;

export function WriteMemory(arg1:number,arg2:any):Promise<number>;
