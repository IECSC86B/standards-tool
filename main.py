import warnings
warnings.filterwarnings("ignore")

from pandas import read_excel
# from js import document
from pyscript import when, document

class program_state:

    def __init__(self):

        self.expected_sheets_and_columns = {

            #DATA LOOKUP TABLES ---------------------------------------------

            "1": [
                "Connector type",
                "Fibre type",
                "PC or APC ferrule end face",
                "Attenuation and return loss grades",
                "Visual connector end face requirements",
                "Connector end face geometric and ferrule parameters",
                "Reference connector attenuation requirements",
                "Reference connector end face geometric and ferrule parameters"
            ],
            "2": [
                "Connector type",
                "Mechanical connector interface"
            ],
            "3": [
                "Performance category - operating service environment (temperature range)",
                "Fibre type",
                "Mechanical and environmental connector performance (terminated as pigtail or patchcord)"
            ],
            "4": [
                "Connector type",
                "Cable type",
                "Mechanical and environmental cable performance (terminated as cable assembly)"
            ],
            "5": [
                "Connector type",
                "Attenuation measurement of randomly mated connectors"
            ],
            "6": [
                "Connector type",
                "Fibre type",
                "Attenuation and return loss measurement of installed cable plant"
            ],
            "7": [
                "Fibre type",
                "Standard"
            ],
            "8": [
                "Standard",
                "Scope"
            ],

            # TABLES FOR FILTERING ---------------------------------------------

            "Filter 1": [
                "IN1",
                "IN2",
                "IN4"
            ], 
            "Filter 2": [
                "IN2",
                "IN4",
                "IN6"
            ],
            "Filter 3": [
                "IN5",
                "IN2"
            ],
            "Filter 4": [
                "IN3",
                "IN1"
            ]
        }

        # Input options
        # This list could be compiled from the excel but it introduces a lot of complexity. Any changes must be updated here
        self.input_options = {
            "IN1": ["LC", "LSH", "MDC", "MPO 1x12", "MPO 1x16", "MPO 2x12", "MPO 2x16", "SAC", "SC", "SEN"],
            "IN2": ["Single-mode", "Multimode"],
            "IN3": ["Primary coated fibre", "Buffered fibre", "Ribbon fibre", "Reinforced cable"],
            "IN4": ["PC", "APC"],
            "IN5": ["B (mean ≤ 0,12 dB; at least 97 % ≤ 0,25 dB)", "C (mean ≤ 0,25 dB; at least 97 % ≤ 0,5 dB)", "D (mean ≤ 0,5 dB; at least 97% ≤ 1,0 dB)", "Bm (mean ≤ 0,3 dB; at least 97 % ≤ 0,6 dB)", "Cm (mean ≤ 0,5 dB; at least 97 % ≤ 1,0 dB)"],
            "IN6": ["1 (≥ 60 dB, mated)", "2 (≥ 45 dB, mated)", "3 (≥ 35 dB, mated)", "4 (≥ 26 dB, mated)", "1m (≥ 45 dB, mated)", "2m (≥ 20 dB, mated)"],
            "IN7": ["C - indoor controlled (-10/+60 °C)", "C-HD - indoor controlled with additional heat dissipation (-10/+70 °C)", "OP - outdoor protected (-25/+70 °C)", "OP+ - outdoor protected with wider temperature range (-40/+75 °C)", "OP+-HD - outdoor protected with wider temperature range and additional heat dissipation  (-40/+85 °C)", "OP-HD - outdoor protected with additional heat dissipation (-25/+85 °C)"]
        }

    def reset_input_values(self):

        self.IN1 = False
        self.IN2 = False
        self.IN3 = False
        self.IN4 = False
        self.IN5 = False
        self.IN6 = False
        self.IN7 = False

    def import_excel(self, filename):
    
        # create empty tables dict
        self.tables = {}

        # iterate through the dictionary, getting the expected sheet name and column list for each sheet in turn
        for sheet, columns in self.expected_sheets_and_columns.items():
            
            # read CSV sheet
            df = read_excel(filename, sheet_name=sheet)

            # Remove any empty columns
            df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

            # get present columns
            present_columns = df.columns.tolist()

            # check expected columns are present
            if sorted(present_columns) == sorted(columns):

                print("Success importing" + filename + " Sheet name: " + sheet)

                # add to dictionary
                self.tables[sheet] = df
            
            else:
                print("Error importing" + filename + " Sheet name: " + sheet + ": columns did not match expected columns")

                for i in range(max(len(columns), len(present_columns))):
                    print("Column " + str(i) + " (exp): " + str(sorted(columns)[i]))
                    print("Column " + str(i) + " (rsv): " + str(sorted(present_columns)[i]))

global program
program = program_state() 

# reset all inputs

@when("click", "#reset_inputs")
def reset_inputs():

    # select empty
    document.getElementById("IN1").selectedIndex = -1
    document.getElementById("IN2").selectedIndex = -1
    document.getElementById("IN3").selectedIndex = -1
    document.getElementById("IN4").selectedIndex = -1
    document.getElementById("IN5").selectedIndex = -1
    document.getElementById("IN6").selectedIndex = -1
    document.getElementById("IN7").selectedIndex = -1
    
    # reset all disabled options
    for input, values in program.input_options.items():
        for option in values:
            selector_string = "#" + input + " option[value='" + option + "']"
            document.querySelector(selector_string).disabled = False

    # reset input values
    program.reset_input_values()

    reset_outputs()
    apply_outputs()

def filter_tables(tables, column_headings, inputs):
        # number of tables
        for key, table in tables.items():

            # apply filters for any INputs the user has chosen
            col_heads_this_table = column_headings[key]

            # check if the IN has a value assigned (it's false otherwise)
            for col_head in col_heads_this_table:
                if inputs[col_head]:
                    
                    col_head_variable = inputs[col_head]

                    # apply the filter
                    filter = table[col_head]==col_head_variable
                    table = table[filter]

            # return to filtered tables
            tables[key] = table
        
        return tables

def enforce_only_options(tables, inputs):

    # cycle through once to find any options which are now the only remaining option,
    # and thus need to be auto-selected

    # for each table
    for key, table in tables.items():
        if len(table) == 1:

            # enforce inputs to mandatory values
            for column in table.columns:
                inputs[column] = table.iloc[0][column]
                print("Enforced the following value for input: " + str(column) + ": " + str(inputs[column]))

    return inputs

def update_inputs():

    # get the filter tables
    tables = {
        "Filter 1": program.tables["Filter 1"],
        "Filter 2": program.tables["Filter 2"],
        "Filter 3": program.tables["Filter 3"],
        "Filter 4": program.tables["Filter 4"]
    }
    
    # column headings
    column_headings = {
        "Filter 1": program.expected_sheets_and_columns["Filter 1"],
        "Filter 2": program.expected_sheets_and_columns["Filter 2"],
        "Filter 3": program.expected_sheets_and_columns["Filter 3"],
        "Filter 4": program.expected_sheets_and_columns["Filter 4"]
    }

    # inputs
    inputs = {
        "IN1": program.IN1,
        "IN2": program.IN2,
        "IN3": program.IN3,
        "IN4": program.IN4,
        "IN5": program.IN5,
        "IN6": program.IN6,
        "IN7": program.IN7
    }

    input_options = program.input_options

    # filter tables
    tables = filter_tables(tables, column_headings, inputs)

    # check for any situations where there's now only 1 remaining valid input, and if so, enforce it
    inputs = enforce_only_options(tables, inputs)

    # reapply table filters and hope it doesn't happen again
    tables = filter_tables(tables, column_headings, inputs)

    # for each input option, check that wherever that input exists in all the filter tables
    # that the option is valid. If so, make it an option. If not, make it a disabled option
    
    # for each input
    for input in inputs:
        # for each input option
        for option in input_options[input]:

            status = True
            # for each table in turn
            for key, table in tables.items():

                # if this input is in this filter table
                if input in table.columns:
                    # check if the option is in the table
                    if option not in table[input].values:
                        status = False
                        selector_string = "#" + input + " option[value='" + option + "']"
                        document.querySelector(selector_string).disabled = True
                        break


@when("change", "#IN1")
def IN1_callback():

    # get value then update possible inputs and outputs
    program.IN1 = document.getElementById("IN1").value
    update_inputs()
    update_outputs()

@when("change", "#IN2")
def IN2_callback():

    # get value
    program.IN2 = document.getElementById("IN2").value
    # update_inputs()
    update_outputs()


@when("change", "#IN3")
def IN3_callback():

    # get value then update possible inputs and outputs
    program.IN3 = document.getElementById("IN3").value
    update_inputs()
    update_outputs()

@when("change", "#IN4")
def IN4_callback():

    # get value then update possible inputs and outputs
    program.IN4 = document.getElementById("IN4").value
    update_inputs()
    update_outputs()

@when("change", "#IN5")
def IN5_callback():

    # get value then update possible inputs and outputs
    program.IN5 = document.getElementById("IN5").value
    update_inputs()
    update_outputs()

@when("change", "#IN6")
def IN6_callback():

    # get value then update possible inputs and outputs
    program.IN6 = document.getElementById("IN6").value
    update_inputs()
    update_outputs()

@when("change", "#IN7")
def IN7_callback():

    # get value then update possible inputs and outputs
    program.IN7 = document.getElementById("IN7").value
    update_inputs()
    update_outputs()

def apply_outputs():

    document.getElementById("OUT1").innerHTML = program.OUT1
    document.getElementById("OUT2").innerHTML = program.OUT2
    document.getElementById("OUT3").innerHTML = program.OUT3
    document.getElementById("OUT4").innerHTML = program.OUT4
    document.getElementById("OUT5").innerHTML = program.OUT5
    document.getElementById("OUT6").innerHTML = program.OUT6
    document.getElementById("OUT7").innerHTML = program.OUT7
    document.getElementById("OUT8").innerHTML = program.OUT8
    document.getElementById("OUT9").innerHTML = program.OUT9
    document.getElementById("OUT10").innerHTML = program.OUT10
    document.getElementById("OUT11").innerHTML = program.OUT11
    document.getElementById("OUT12").innerHTML = program.OUT12
    document.getElementById("OUT13").innerHTML = program.OUT13
    document.getElementById("OUT14").innerHTML = program.OUT14
    document.getElementById("OUT15").innerHTML = program.OUT15
    document.getElementById("OUT16").innerHTML = program.OUT16
    document.getElementById("OUT17").innerHTML = program.OUT17

def reset_outputs():

    program.OUT1 = "To be assigned"
    program.OUT2 = "To be assigned"
    program.OUT3 = "To be assigned"
    program.OUT4 = "To be assigned"
    program.OUT5 = "To be assigned"
    program.OUT6 = "To be assigned"
    program.OUT7 = "To be assigned"
    program.OUT8 = "To be assigned"
    program.OUT9 = "To be assigned"
    program.OUT10 = "To be assigned"
    program.OUT11 = "To be assigned"
    program.OUT12 = "To be assigned"
    program.OUT13 = "To be assigned"
    program.OUT14 = "To be assigned"
    program.OUT15 = "To be assigned"
    program.OUT16 = "To be assigned"
    program.OUT17 = "To be assigned"

    apply_outputs()

def update_outputs():

    try:
        print("IN1: " + program.IN1)
        print("IN2: " + program.IN2)
        print("IN3: " + program.IN3)
        print("IN4: " + program.IN4)
        print("IN5: " + program.IN5)
        print("IN6: " + program.IN6)
        print("IN7: " + program.IN7)
    except:
        pass

    reset_outputs()

    table_1 = program.tables["1"]
    table_2 = program.tables["2"]
    table_3 = program.tables["3"]
    table_4 = program.tables["4"]
    table_5 = program.tables["5"]
    table_6 = program.tables["6"]
    table_7 = program.tables["7"]
    table_8 = program.tables["8"]

    # OUT1 and OUT9
    if program.IN1:

        program.OUT1 = table_2[table_2["Connector type"]==program.IN1].iloc[0]["Mechanical connector interface"]
        print("OUT1: " + program.OUT1)

        program.OUT9 = table_5[table_5["Connector type"]==program.IN1].iloc[0]["Attenuation measurement of randomly mated connectors"]
        print("OUT9: " + program.OUT9)

    # OUT2, OUT3, OUT4, OUT7, OUT8
    if program.IN1 and program.IN2 and program.IN4:

        filter1 = table_1["Connector type"]==program.IN1
        filter2 = table_1["Fibre type"]==program.IN2
        filter3 = table_1["PC or APC ferrule end face"]==program.IN4
        out = table_1[filter1 & filter2 & filter3]
        
        # check the combination of filters resulted in a valid output
        if len(out):
            program.OUT2 = out.iloc[0]["Attenuation and return loss grades"]
            program.OUT3 = out.iloc[0]["Visual connector end face requirements"]
            program.OUT4 = out.iloc[0]["Connector end face geometric and ferrule parameters"]
            program.OUT7 = out.iloc[0]["Reference connector attenuation requirements"]
            program.OUT8 = out.iloc[0]["Reference connector end face geometric and ferrule parameters"]
        
        print("OUT2: " + program.OUT2)
        print("OUT3: " + program.OUT3)
        print("OUT4: " + program.OUT4)
        print("OUT7: " + program.OUT7)
        print("OUT8: " + program.OUT8)
    
    # OUT5
    if program.IN2 and program.IN7:

        filter1 =  table_3["Performance category - operating service environment (temperature range)"]==program.IN7
        filter2 =  table_3["Fibre type"]==program.IN2
        out = table_3[filter1 & filter2]

        if len(out):
            program.OUT5 = out.iloc[0]["Mechanical and environmental connector performance (terminated as pigtail or patchcord)"]
            print("OUT5: " + program.OUT5)

    # OUT6
    if program.IN1 and program.IN3:

        filter1 =  table_4["Cable type"]==program.IN3
        filter2 =  table_4["Connector type"]==program.IN1
        out = table_4[filter1 & filter2]

        if len(out):
            program.OUT6 = out.iloc[0]["Mechanical and environmental cable performance (terminated as cable assembly)"]
            print("OUT6: " + program.OUT6)

    # OUT10
    program.OUT10 = table_8[table_8["Scope"]=="Return loss measurement"]["Standard"].iloc[0]
    print("OUT10: " + program.OUT10)

    # OUT11 and OUT16
    program.OUT11 = table_8[table_8["Scope"]=="Visual connector end face inspection procedure"]["Standard"].iloc[0]
    program.OUT16 = program.OUT11

    print("OUT11: " + program.OUT11)
    print("OUT16: " + program.OUT16)

    # OUT12
    program.OUT12 = table_8[table_8["Scope"]=="Visual connector end face inspection microscope requirements"]["Standard"].iloc[0]
    print("OUT12: " + program.OUT12)

    # OUT13
    program.OUT13 = table_8[table_8["Scope"]=="Planning and installation of premises cabling"]["Standard"].iloc[0]
    print("OUT13: " + program.OUT13)

    # OUT14
    program.OUT14 = table_8[table_8["Scope"]=="Testing of optical fibre cabling (inspection and cleaning of connector end faces, optical performance testing)"]["Standard"].iloc[0]
    print("OUT14: " + program.OUT14)

    # OUT15
    if program.IN1 and program.IN2:

        filter1 =  table_6["Connector type"]==program.IN1
        filter2 =  table_6["Fibre type"]==program.IN2
        out = table_6[filter1 & filter2]

        if len(out):
            program.OUT15 = out.iloc[0]["Attenuation and return loss measurement of installed cable plant"]
            print("OUT15: " + program.OUT15)

    # OUT17
    program.OUT17 = table_8[table_8["Scope"]=="Cleaning methods"]["Standard"].iloc[0]
    print("OUT17: " + program.OUT17)

    apply_outputs()

# Initial data acquisition from CSV files
filename = "./assets/program_logic_v6.xlsx"
program.import_excel(filename)
reset_inputs()