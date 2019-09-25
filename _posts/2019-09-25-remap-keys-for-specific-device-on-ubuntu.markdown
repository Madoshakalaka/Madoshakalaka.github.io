---
layout: post
title:  "Remap keys for specific device on ubuntu"
date:   2019-09-25 00:47:00 -0600
categories: 
---


People love programmable peripherals. Yet few may know one can easily make any keyboad/keypad programmable on Ubuntu.

Time to lay out all your spare keypads and keyboards and build your self a real hacker console. (or play the piano)

![peripherals](/assets/peripherals.jpeg)


## Remap keys

---
### tl;dr

- `sudo apt-get install -y evtest`

- Use `evtest` to check device info

- `vim /lib/udev/hwdb.d/60-keyboard.hwdb` and follow the instruction

---

On Linux systems, one can write `hwdb` files to remap physical keys or parts on a certain device.

We first need to know information about the device we want to edit (keyboard/keypad) 

### Get device ID

`evtest` is an amazing tool to tell us info about our devices

`sudo apt-get install -y evtest` to install it.

Next run `$ sudo evtest` to get a list of your devices:
```
matt@host:/etc/udev/hwdb.d$ sudo evtest
Available devices:
...
/dev/input/event6:	Razer Razer Orbweaver Chroma            (keypad)
/dev/input/event9:	Razer Razer BlackWidow Ultimate 2016    (keyboard)
/dev/input/event11:	Compx 2.4G Receiver                     (wireless keyboard)
/dev/input/event12:	Compx 2.4G Receiver                     (wireless mouse)
...
Select the device event number [0-23]: 
```

Now select the device you want to modify by providing the number and press enter. Let's say we chose the keypad.

```
Select the device event number [0-15]: 6
Input driver version is 1.0.1
Input device ID: bus 0x3 vendor 0x1532 product 0x20d version 0x1a1
Input device name: "Razer Razer Orbweaver Chroma"
Supported events:
  Event type 0 (EV_SYN)
  Event type 1 (EV_KEY)
    Event code 1 (KEY_ESC)
    Event code 2 (KEY_1)
    Event code 3 (KEY_2)
    Event code 4 (KEY_3)
    Event code 5 (KEY_4)
    Event code 6 (KEY_5)
    ...                         (A bunch key codes saying what this device can do)
Properties:
Testing ... (interrupt to exit)
``` 

The most important thing we want from this output is the **Input device ID** as we'll use it later in 
an `hwdb` file to identify the device

> Input device ID: bus 0x3 vendor 0x1532 product 0x20d version 0x1a1


To confirm you have chosen the right device. If you just press random keys on that device, you'll see feedbacks on the terminal
as `evtest` is now detecting your key presses from this device.

### Get scancode for physical key

Now press the physical key you want to remap, `evtest` prints information like this:
```
Testing ... (interrupt to exit)
Event: time 1569402713.766496, type 17 (EV_LED), code 0 (LED_NUML), value 0
Event: time 1569402713.766496, type 4 (EV_MSC), code 4 (MSC_SCAN), value 7002c
Event: time 1569402713.766496, type 1 (EV_KEY), code 57 (KEY_SPACE), value 1
```


Basically each physical key has a **scancode**.

What we want from this output is  the line with **`MSC_SCAN`**. 

> Event: time 1569402713.766496, type 4 (EV_MSC), code 4 (**MSC_SCAN**), value 7002c

The hex number `7002c` here is the **scancode** for the physical key.


### Write hwbd script

Lastly we need to know the **keycode** of the target key we want to remap to.

A **keycode** is simply a string (note: not a number), most of the times it's intuitive. e.g. "space" "0" "f1"

You can see a sorted list on this [web page](https://hal.freedesktop.org/quirk/quirk-keymap-list.txt) or check `/usr/include/linux/input-event-codes.h`

Note in `input-event-codes.h` only the part after "KEY_" is the keycode

```
input-event-codes.h

#define KEY_X                   45
#define KEY_C                   46
#define KEY_V                   57
#define KEY_SLASH               53
#define KEY_RIGHTSHIFT          54

```

Now that we have **device ID**, **scancode**, and **keycode**,
it's finally time to write the remapping script.

Let's create `90-custom-keyboard.hwdb` under `/etc/udev/hwdb.d` 

The filename can be arbitrary as long as it's not identical as one of the names of system `hwdb` files under `/lib/udev/hwdb.d` 
while it's a convention to have numbers and dash at the beginning

Now write the following content to the new `hwdb` file


```
# 90-custom-keyboard.hwdb

evdev:input:bZZZZvYYYYpXXXXeWWWW*
 KEYBOARD_KEY_<scancode>=<keycode>
```

Recall the **input device ID** we got previously

> Input device ID: bus 0x3 vendor 0x1532 product 0x20d version 0x1a1


Replace ZZZZ with bus, YYYY with vendor, XXXX with product, and WWWW with version. Lastly add an asterisk.

Left pad zero if necessary and use upper case hex letters.


For our case, if we want to remap the key to space bar, the file looks like this:

```
# 90-custom-keyboard.hwdb

evdev:input:b0003v1532p020De01A1*
 KEYBOARD_KEY_7002c=space
```


It's also intuitive to add multiple devices and keys:

```
# 90-custom-keyboard.hwdb

evdev:input:b0003v1532p020De01A1*
 KEYBOARD_KEY_7002c=space
 KEYBOARD_KEY_7123=down
 KEYBOARD_KEY_24e1=a
 KEYBOARD_KEY_23a3=b
 
evdev:input:b0002v1512p221De2311*
 KEYBOARD_KEY_12b41=1
 KEYBOARD_KEY_2113=up
 KEYBOARD_KEY_4411=down
 KEYBOARD_KEY_2223=4
 
...
 
```

At last we need to apply our settings by running this following commands

- `$sudo systemd-hwdb update`
- `$sudo udevadm trigger --sysname-match="event*"`

Congrat! Now your keys are remapped!


## Macros

Lame thing first: it's not easy to do macros. You can not remap keys to key combinations either.

You can, however use the following approach


- Install `xdotools` with `$ sudo apt-get install xdotools` on the terminal

    `xdotools` is an amazing macro command player. Yet it's only accessible
    from the terminal. And one need to write macro in shell script in order to play it.
    
- write shell script with `xdotools`. `chmod +x <script_name>` and put it under `/usr/bin`
- Go to `Settings>Devices>Keyboard`. Scroll to the bottom to add a custom shortcut with `command` field being `<script_name>`.

    One can remap unused keycodes (There are plenty: e.g. pause/break, screen lock, 
    multimedia keys...) to some physical key on a device and make it a custom shortcut.
    Then it's essentially a one-key macro.  

The difficulty is in writing the shell script. It's quite some learning curve. I recommend searching online for resources and try out simple ones first.

On the other hand, being able to write a script is also a huge virtue. You will be able to have finer control over the macro.


The following is a very specific macro I wrote, which, say one won't be able to craft in "Razer Synapse" (driver for razer peripherals)

```
If currently focused window is "Pycharm":
    click on the right side of the opened window
    press pagedown
    move mouse back to original position
else
    do nothing
```

## Other Resources

If you are familiar with Python. Check [`pyautogui`](https://pypi.org/project/PyAutoGUI/) 
[`pynput`](https://pypi.org/project/pynput/)
 [`pyahk`](https://pyahk.readthedocs.io/en/latest/), they can substitute `xdotools` if shell scripts are not your thing.