function replace_css_placeholder() {
    css=""
    css_tag="<link rel=\"stylesheet\" type=\"text/css\" href=\"../assets/css/__file__\">"
    for css_file in $(ls assets/css); do
        copy=$css_tag
        copy=${copy/__file__/$css_file}
        css+=$copy
    done
    # use | as delimiter because $css contains slashes, else I'll have to escape them before substituting
    sed -e "s|__css_placeholder__|$css|" $1 $2
}

function generate_base_html() {
    replace_css_placeholder _layouts/base.html >post.html
}

function replace_header() {
    sed "/__header__/{
        s/__header__//g
        r _layouts/header.html
    }" -i $1
}

function replace_footer() {
    sed "/__footer__/{
        s/__footer__//g
        r _layouts/footer.html
    }" -i $1
}

function generate_posts() {
    dir="_posts"
    posts=$(ls $dir/)     #generate array of file names
    mkdir out 2>/dev/null #ignore warning msgs and redirect stderr to /dev/null
    cp -r assets _site/

    for md_file in $posts; do

        # get title from first line
        title=$(awk 'NR == 1' _posts/$md_file)
        title=${title:2}

        page_dir=${md_file:4}     # substring to ignore the prefixed digits
        page_dir=${page_dir/.md/} #replace .md with empty char
        out_file="index.html"
        echo generating $md_file

        # skip first line and write everything else to temp
        awk "NR > 1" $dir/$md_file >temp
        # generate html of post from markdown file
        lowdown temp -thtml --html-no-escapehtml --html-no-skiphtml -o content.html
        rm temp

        # replace __content__ with whatever is inside content.html
        sed "/__content__/{
            s/__content__//g
            r content.html
        }" _layouts/post.html >_site/$out_file

        # edit in place
        sed "s/__title__/$title/" -i _site/$out_file

        sed "/__content__/{
            s/__content__//g
            r _site/$out_file
        }" post.html >temp
        mv temp _site/$out_file

        sed "s/__title__/$title/" -i _site/$out_file

        mkdir _site/$page_dir 2>/dev/null # ignore errors of dir already exists

        replace_header "_site/$out_file"
        replace_footer "_site/$out_file"

        mv _site/$out_file _site/$page_dir

        # TODO: generate seo tag for each post - use jekyll seo tag as reference
        # TODO: add google analytics tag if env is prodution, add env tag in github actions
    done
}

function generate_date() {
    echo ""
}

function generate_home() {
    cp _layouts/home.html _site/index.html
    replace_footer _site/index.html
    replace_header _site/index.html
    lowdown README.md -thtml --html-no-escapehtml --html-no-skiphtml -o temp
    sed "/__home_content__/{
        s/__home_content__//
        r temp
     }" -i _site/index.html
    rm temp

    dir="_posts"
    # generate array of file names in reverse order
    # to keep the latest posts on top
    posts=$(ls $dir/ | sort -r)

    touch post_links.html
    chmod 777 post_links.html

    for md_file in $posts; do
        # get title from first line
        title=$(awk "NR == 1" _posts/$md_file)
        title=${title:2}

        # generate html of post from markdown file
        page_dir=${md_file:4}     # substring to ignore the prefixed digits
        page_dir=${page_dir/.md/} #replace .md with empty char

        sed -e "s/__post_hyperlink__/$page_dir/" -e "s/__title__/$title/" _layouts/home-post-link.html >temp_link

        date_string=$(awk "NR == 2" _posts/$md_file)
        date=$(date --date="$date_string" "+%d %b %Y")

        sed "s/__date__/$date/" temp_link >>post_links.html
        rm temp_link
    done

    sed "/__post_links__/{
            s/__post_links__//
            r post_links.html
        }" -i _site/index.html

    replace_css_placeholder _site/index.html -i
    # TODO: generate the hash to display as decor in homepage
}

generate_base_html
generate_posts
generate_home
cp -r source_code/ _site/

#cleanup
rm post.html
rm content.html
rm post_links.html
