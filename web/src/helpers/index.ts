export const maskAddress=(address:string)=>{
    const prefix= '****';
    return prefix + address.slice(36,42);
}