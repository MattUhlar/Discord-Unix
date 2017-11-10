from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, BLOB

Base = declarative_base()

class Downloads(Base):
    __tablename__ = 'downloads'

    id = Column(Integer, primary_key=True)
    guid = Column(String)
    current_path = Column(String)
    target_path = Column(String)
    start_time = Column(Integer)
    recieved_bytes = Column(Integer)
    total_bytes = Column(Integer)
    state = Column(Integer)
    danger_type = Column(Integer)
    interrupt_reason = Column(Integer)
    hash = Column(BLOB)
    end_time = Column(Integer)
    opened = Column()
    last_access_time = Column(Integer)
    transient = Column(Integer)
    referrer = Column(String)
    site_url = Column(String)
    tab_url = Column(String)
    tab_referrer = Column(String)
    http_method = Column(String)
    by_ext_id = Column(String)
    by_ext_name = Column(String)
    etag = Column(String)
    last_modified = Column(String)
    mime_type = Column(String)
    original_mime_type = Column(String)

class DownloadsSlices(Base):
    __tablename__ = 'downloads_slices'

    download_id = Column(Integer, primary_key=True)
    offset = Column(Integer, primary_key=True)
    recieved_bytes = Column(Integer)

class DownloadsUrlChains(Base):
    __tablename__ = 'downloads_url_chains'

    id = Column(Integer, primary_key=True)
    chain_index = Column(Integer, primary_key=True)
    url = Column(Integer)

class KeywordSearchItems(Base):
    __tablename__ = 'keyword_search_items'

    keyword_id = Column(Integer, primary_key=True)
    url_id = Column(Integer, primary_key=True)
    lower_term = Column(String, primary_key=True)
    term = Column(String, primary_key=True)

class Meta(Base):
    __tablename__ = 'meta'

    key = Column(String, primary_key=True)
    value = Column(String)

class SegmentUsage(Base):
    __tablename__ = 'segment_usage'

    id = Column(Integer, primary_key=True)
    segment_id = Column(Integer)
    time_slot = Column(Integer)
    visit_count = Column(Integer)

class Segments(Base):
    __tablename__ = 'segments'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    url_id = Column(Integer)

class SqliteSequence(Base):
    __tablename__ = 'sqlite_sequence'

    name = Column(String, primary_key=True)
    seq = Column(String, primary_key=True)

class TypedUrlSyncMetadata(Base):
    __tablename__ = 'typed_url_sync_metadata'

    storage_key = Column(Integer, primary_key=True)
    value = Column(BLOB)

class Urls(Base):
    __tablename__ = 'urls'

    id = Column(Integer, primary_key=True)
    url = Column(String)
    title = Column(String)
    visit_count = Column(Integer)
    typed_count = Column(Integer)
    last_visit_time = Column(Integer)
    hidden = Column(Integer)

class VisitSource(Base):
    __tablename__ = 'visit_source'

    id = Column(Integer, primary_key=True)
    source = Column(Integer)

class Visits(Base):
    __tablename__ = 'visits'

    id = Column(Integer, primary_key=True)
    url = Column(Integer)
    visit_time = Column(Integer)
    from_visit = Column(Integer)
    transition = Column(Integer)
    segment_id = Column(Integer)
    visit_duration = Column(Integer)
