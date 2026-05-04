The IEC SC86B standards tool is intended to assist standards-users interested in the area of fibre optic interconnecting devices and passive components in identifying relevant standards for their purpose.  
The tool is for informative purposes only, and in all cases, users are recommended to refer to the latest version of the respective standard.  

**Function**

* To use the tool, select the drop-down inputs in any order
* Following each selection, options in other inputs will be filtered and any incompatible options will be disabled. Once you have selected an input it cannot be changed
* Results are displayed in the 'outputs' section once the required input(s) have been selected
* To start again, click 'reset'

**Design**  
The tool uses a CSV file to store the following information in tables:  
* Standards associated with a particular technical construction (combination of input(s))
* Compatible and incompatible options. For example, after selecting _fibre type = multimode_, the only valid _return loss_ options are _1m_ and _2m_

> The tool cross-references information in 3 places: (1) CSV file, including headings; (2) HTML file, using the _value_ of the selected option for each input; (3) an array in _main.js_ which contains expected sheets and column headings. The tool will fail to operate correctly if the text in one of these 3 locations does not match exactly

**Contact for changes or comments**    
Please contact the IEC SC86B secretary using the following portal:  
https://www.iec.ch/ords/f?p=107:3:0::::P3_ADDRESS_ID,P3_NAMETO,P3_SUBJECT:92120,Ryo%20Koyama,Selector%20for%20relevant%20IEC%20connector%20standards
