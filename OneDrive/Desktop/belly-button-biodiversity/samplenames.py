# import necessary libraries
import pandas as pd

#read csv and create dataframe
samples_df = pd.read_csv('DataSets/belly_button_biodiversity_samples.csv',index_col=0)

# retrieve the list of sample names
names= list(samples_df.columns.values)
