export class Message {
    id_receiver!: string;
    content: String=""; 
    datetime: String=""; 
    mode:String="";  
    images!:String[];
    imagesToSend!:String[][];
    is_read!:boolean;
    _image!:boolean;
    isf!:boolean;
    time:String="";
    id_sender!: string;
    addPadding!:boolean
    showAvatar!:boolean
    showTime!:boolean

}