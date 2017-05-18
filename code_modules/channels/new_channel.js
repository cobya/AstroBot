// Inserting channels into the channels database
	INSERT INTO public."Channels"(
	"Channel_Name", "Connected")
	VALUES ('tddastronaught', 'false');

// Creating the channel's table
CREATE TABLE public."Channel_tddastronaught"
(
	"Channel_Username" text,
	"Bot_Managers" text,
	"Channel_Regulars" text,
	"Enable_Global_Commands" boolean,
	"Global_Commands_Userlevel" text,
	"Global_Commands_Cooldown" integer,
	"Enforce_Global_Blacklist" boolean,
	"Timeout_Links" boolean,
	"Whitelisted_Links" text,
	"Link_Exempt_Userlevel" text,
	"Link_Timeout_Whisper" boolean,
	"Link_Whisper_Message" text,
	"Timeout_Emote_Spam" boolean,
	"Emote_Spam_Limit" integer,
	"Emote_Exempt_Userlevel" text,
	"Emote_Timeout_Whisper" boolean,
	"Emote_Whisper_Message" text,
	"Timeout_Symbol_Spam" boolean,
	"Symbol_Spam_Limit" integer,
	"Symbol_Exempt_Userlevel" text,
	"Symbol_Timeout_Whisper" boolean,
	"Symbol_Whisper_Message" text,
	"Timeout_Caps_Spam" boolean,
	"Caps_Spam_Limit" integer,
	"Caps_Exempt_Userlevel" text,
	"Caps_Timeout_Whisper" boolean,
	"Caps_Whisper_Message" text,
	"Timeout_Repeated_Words" boolean,
	"Repeated_Words_Limit" integer,
	"Repeated_Words_Exempt_Userlevel" text,
	"Repeated_Words_Timeout_Whisper" boolean,
	"Repeated_Words_Whisper_Message" text,
	"Timeout_Copypasta_Spam" boolean,
	"Copypasta_Trigger_Limit" integer,
	"Copypasta_Previous_Messages_Limit" integer,
	"Copypasta_Exempt_Userlevel" text,
	"Copypasta_Timeout_Whisper" boolean,
	"Copypasta_Whisper_Message" text,
	"Channel_Blacklist_Enabled" boolean,
	"Channel_Blacklist_Type" text,
	"Channel_Blacklist_Input" text,
	"Channel_Blacklist_Action" integer,
	"Channel_Timer" text,
	"Channel_Timer_Enabled" boolean,
	"Channel_Timer_Interval" integer,
	"Channel_Timer_Activity_Requirement" integer,
	"Channel_Timer_Message" text,
	"Channel_Custom_Command" text,
	"Channel_Custom_Command_Cooldown" integer,
	"Channel_Custom_Command_On_Cooldown" boolean,
	"Channel_Custom_Command_Message" text,
	"Channel_Sub_Message_Enabled" boolean,
	"Channel_Sub_Message" text,
	"Channel_ReSub_Message" text,
	"Channel_Bits_Message_Enabled" boolean,
	"Channel_Bits_Message" text
)
WITH (
	OIDS = FALSE
);

ALTER TABLE public."Channel_tddastronaught"
	OWNER to zbaigkctiqfhqd;
