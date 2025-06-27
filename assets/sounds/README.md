# IraChat Audio Assets

This directory contains audio files for the calling functionality:

## Files:
- `ringtone.mp3` - Default ringtone for incoming calls
- `incoming-call.mp3` - Incoming call ringtone
- `call-connect.mp3` - Call connection sound
- `call-end.mp3` - Call end sound
- `notification.mp3` - General notification sound

## Usage:
These audio files are loaded by the calling service and played during various call states.

## Format:
- Format: MP3
- Quality: 44.1kHz, 16-bit
- Duration: 3-10 seconds (looping for ringtones)

## Note:
For production, replace these with actual audio files. The current implementation will gracefully handle missing files.
