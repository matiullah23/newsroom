import pandas as pd
import os
import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from samplenames import names

from flask import Flask, jsonify, render_template
app = Flask(__name__)


################################################
# Database Setup
################################################
dbfile = os.path.join('db/belly_button_biodiversity.sqlite')
engine = create_engine(f"sqlite:///{dbfile}")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
Samples_Metadata = Base.classes.samples_metadata
OTU = Base.classes.otu
Samples = Base.classes.samples

# Create our session (link) from Python to the DB
session = Session(engine)

@app.route('/otu')
def list_otu():
    results = session.query(OTU.lowest_taxonomic_unit_found).all()
    # return jsonify(results)

    otus = list(np.ravel(results))

    return jsonify(otus)


@app.route('/metadata/<sample>')
def metadata(sample):
    sample_data = [Samples_Metadata.SAMPLEID, Samples_Metadata.ETHNICITY, Samples_Metadata.GENDER, Samples_Metadata.AGE, Samples_Metadata.LOCATION, Samples_Metadata.BBTYPE]
    results = session.query(*sample_data).\
        filter(Samples_Metadata.SAMPLEID == sample[3:]).all()

    sample_metadata = {}

    for result in results:
        sample_metadata["SAMPLEID"] = result[0]
        sample_metadata["ETHNICITY"] = result[1]
        sample_metadata["GENDER"] = result[2]
        sample_metadata["AGE"] = result[3]
        sample_metadata["LOCATION"] = result[4]
        sample_metadata["BBTYPE"] = result[5]

    return jsonify(sample_metadata)

@app.route('/samples/<sample>')
def samples(sample):
   results = session.query(Samples).statement
   df = pd.read_sql_query(results, session.bind)

   if sample not in df.columns:
       return jsonify(f"Error! Sample: {sample} Not Found!"), 400


   df = df[df[sample] > 1]


   df = df.sort_values(by=sample, ascending=0)


   data = [{
   "otu_ids": df[sample].index.values.tolist(),
   "sample_values": df[sample].values.tolist()
   }]
   return jsonify(data)



@app.route("/wfreq/<sample>")
def metadate(sample):
    washfreq= [Samples_Metadata.SAMPLEID, Samples_Metadata.WFREQ]
    results = session.query(*washfreq).\
        filter(Samples_Metadata.SAMPLEID == sample[3:]).all()

    wash= {}

    for result in results:
        wash["SAMPLEID"] = result[0]
        wash["WFREQ"] = result[1]

    return jsonify(wash)





@app.route("/")
def index():
    return render_template('index.html')

@app.route("/names")
def list_names():
    return jsonify(names)


if __name__ == "__main__":
        app.run()
